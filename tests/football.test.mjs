import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, basename, sep } from "node:path";
import {
  createFootballService,
  normalizeFixture,
} from "../server/football.mjs";
import { createBudget } from "../server/budget.mjs";

// Synthetic fixtures exercise parsing only; these are never shipped as live data.
const raw = {
  fixture: {
    id: 123,
    date: "2026-11-01T15:00:00+00:00",
    status: { short: "NS", long: "Not Started", elapsed: null },
  },
  league: { name: "Test league" },
  teams: { home: { name: "Test Home" }, away: { name: "Test Away" } },
  goals: { home: null, away: null },
};
const ok = () =>
  new Response(JSON.stringify({ errors: [], response: [raw] }), {
    status: 200,
  });
const budget = { reserve: async () => {} };
test("previous dates use separate provider caches and report the requested date", async () => {
  const urls = [];
  const service = createFootballService({ key: "test-only", budget, fetchImpl: async (url) => { urls.push(url); return ok(); } });
  const previous = await service.fixtures("2026-10-31");
  await service.fixtures("2026-11-01");
  await service.fixtures("2026-10-31");
  assert.equal(previous.date, "2026-10-31");
  assert.equal(urls.length, 2);
  assert.ok(urls[0].includes("date=2026-10-31"));
  for (const invalid of ["2026-02-30", "bad", "2026-13-01", ""]) {
    await assert.rejects(service.fixtures(invalid), (error) => error.status === 400);
  }
  assert.equal(urls.length, 2);
});
test("period scores preserve zero and missing values, with the provider match clock", () => {
  const match = normalizeFixture({
    ...raw,
    fixture: { ...raw.fixture, status: { short: "2H", long: "Second Half", elapsed: 90, extra: 5 } },
    score: { halftime: { home: 0, away: 1 }, fulltime: { home: null, away: null }, extratime: null, penalty: { home: 0, away: 0 } },
  });
  assert.deepEqual(match.scores.halftime, { home: 0, away: 1 });
  assert.deepEqual(match.scores.fulltime, { home: null, away: null });
  assert.deepEqual(match.scores.penalty, { home: 0, away: 0 });
  assert.equal(match.scores.extratime, null);
  assert.equal(match.elapsed, 90);
  assert.equal(match.addedTime, 5);
  assert.equal(match.statusLabel, "Second Half");
  assert.equal(normalizeFixture(raw).scores.halftime, null);
});
test("provider badges and match details survive normalization without fabricated defaults", () => {
  const match = normalizeFixture({
    ...raw,
    fixture: { ...raw.fixture, referee: "Test referee", venue: { name: "Test stadium", city: "Test city" } },
    league: { name: "Test league", country: "Test country", logo: "https://example.com/league.png", season: 2026, round: "Round 3" },
    teams: { home: { name: "Test Home", logo: "https://example.com/home.png" }, away: { name: "Test Away", logo: null } },
  });
  assert.equal(match.homeLogo, "https://example.com/home.png");
  assert.equal(match.awayLogo, null);
  assert.equal(match.leagueLogo, "https://example.com/league.png");
  assert.equal(match.venue, "Test stadium");
  assert.equal(match.city, "Test city");
  assert.equal(match.referee, "Test referee");
  assert.equal(match.season, 2026);
  assert.equal(match.round, "Round 3");
  assert.equal(normalizeFixture(raw).venue, null);
  assert.equal(normalizeFixture(raw).homeLogo, null);
});
test("missing scores remain unknown, and time alone never implies live", () => {
  const f = normalizeFixture(raw);
  assert.equal(f.score, "— : —");
  assert.equal(f.phase, "scheduled");
  assert.equal(f.source, "api-football");
  assert.equal(
    normalizeFixture({
      ...raw,
      fixture: {
        ...raw.fixture,
        status: { short: "PST", long: "Postponed", elapsed: null },
      },
    }).phase,
    "unknown",
  );
});
test("no key produces no upstream request and no simulated results", async () => {
  let calls = 0;
  const service = createFootballService({
    budget,
    fetchImpl: async () => {
      calls++;
      return ok();
    },
  });
  await assert.rejects(service.fixtures(), (e) => e.status === 503);
  assert.equal(calls, 0);
});
test("cache and concurrent requests share a single upstream call", async () => {
  let calls = 0;
  const service = createFootballService({
    key: "test-only-secret",
    budget,
    now: () => Date.UTC(2026, 10, 1),
    fetchImpl: async (url, options) => {
      calls++;
      assert.ok(url.includes("date=2026-11-01"));
      assert.equal(options.headers["x-apisports-key"], "test-only-secret");
      return ok();
    },
  });
  const [a, b] = await Promise.all([service.fixtures(), service.fixtures()]);
  await service.fixtures();
  await service.fixture("123");
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a).includes("test-only-secret"), false);
});
test("HTTP-200 provider errors and invalid payloads do not look like empty matches", async () => {
  for (const body of [
    { errors: { token: "test-only-secret invalid" }, response: [] },
    { errors: [], response: [{}] },
  ]) {
    const service = createFootballService({
      key: "test-only-secret",
      budget,
      fetchImpl: async () => new Response(JSON.stringify(body)),
    });
    await assert.rejects(
      service.fixtures(),
      (e) => e.status === 502 && !e.message.includes("test-only-secret"),
    );
  }
});
test("last good data keeps its timestamp and is marked stale on refresh failure", async () => {
  let time = Date.UTC(2026, 10, 1),
    calls = 0;
  const service = createFootballService({
    key: "test",
    budget,
    now: () => time,
    refreshSeconds: 15,
    fetchImpl: async () => {
      calls++;
      if (calls > 1) throw new Error("network");
      return ok();
    },
  });
  const good = await service.fixtures();
  time += 16000;
  const stale = await service.fixtures();
  assert.equal(stale.stale, true);
  assert.equal(stale.fetchedAt, good.fetchedAt);
  assert.ok(stale.warning);
  await service.fixtures();
  assert.equal(calls, 2);
});
test("rate limiting and invalid fixture IDs are handled explicitly", async () => {
  let calls = 0;
  const service = createFootballService({
    key: "test",
    budget,
    fetchImpl: async () => {
      calls++;
      return new Response("", { status: 429 });
    },
  });
  await assert.rejects(service.fixture("../status"), (e) => e.status === 400);
  assert.equal(calls, 0);
  await assert.rejects(service.fixtures(), (e) => e.status === 429);
});
test("daily request budget survives restart and resets on the next UTC date", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "sport-coins-budget-"));
  t.after(async () => {
    const target = resolve(dir);
    assert.ok(target.startsWith(resolve(tmpdir()) + sep));
    assert.match(basename(target), /^sport-coins-budget-/);
    await rm(target, { recursive: true, force: true });
  });
  let time = Date.UTC(2026, 10, 1);
  const options = { file: join(dir, "budget.json"), limit: 2, now: () => time };
  await createBudget(options).reserve();
  await createBudget(options).reserve();
  await assert.rejects(
    createBudget(options).reserve(),
    (e) => e.status === 429,
  );
  time += 86400000;
  await createBudget(options).reserve();
});
