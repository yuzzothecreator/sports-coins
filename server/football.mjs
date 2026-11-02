import { z } from "zod";

const scorePair = z.object({
  home: z.number().int().nonnegative().nullable(),
  away: z.number().int().nonnegative().nullable(),
});
const rawFixture = z.object({
  fixture: z.object({
    id: z.number().int().positive(),
    date: z.string().datetime({ offset: true }),
    referee: z.string().nullable().optional(),
    venue: z.object({ name: z.string().nullable(), city: z.string().nullable() }).nullable().optional(),
    status: z.object({
      short: z.string(),
      long: z.string(),
      elapsed: z.number().nullable(),
      extra: z.number().nullable().optional(),
    }),
  }),
  league: z.object({
    name: z.string(),
    country: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    season: z.number().optional(),
    round: z.string().nullable().optional(),
  }),
  teams: z.object({
    home: z.object({ name: z.string(), logo: z.string().nullable().optional() }),
    away: z.object({ name: z.string(), logo: z.string().nullable().optional() }),
  }),
  goals: z.object({
    home: z.number().int().nonnegative().nullable(),
    away: z.number().int().nonnegative().nullable(),
  }),
  score: z.object({
    halftime: scorePair.nullable().optional(),
    fulltime: scorePair.nullable().optional(),
    extratime: scorePair.nullable().optional(),
    penalty: scorePair.nullable().optional(),
  }).nullable().optional(),
});
export function normalizeFixture(value) {
  const raw = rawFixture.parse(value);
  const code = raw.fixture.status.short;
  const phase = ["1H", "2H", "ET", "P", "LIVE"].includes(code)
    ? "live"
    : ["HT", "BT", "INT", "SUSP"].includes(code)
      ? "paused"
      : ["FT", "AET", "PEN"].includes(code)
        ? "finished"
        : ["NS", "TBD"].includes(code)
          ? "scheduled"
          : ["CANC", "ABD", "AWD", "WO"].includes(code)
            ? "cancelled"
            : "unknown";
  const initials = (name) =>
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  return {
    id: String(raw.fixture.id),
    sport: "Football",
    league: raw.league.name,
    home: raw.teams.home.name,
    away: raw.teams.away.name,
    homeLogo: raw.teams.home.logo || null,
    awayLogo: raw.teams.away.logo || null,
    leagueLogo: raw.league.logo || null,
    country: raw.league.country || null,
    season: raw.league.season || null,
    round: raw.league.round || null,
    referee: raw.fixture.referee || null,
    venue: raw.fixture.venue?.name || null,
    city: raw.fixture.venue?.city || null,
    statusLabel: raw.fixture.status.long,
    elapsed: raw.fixture.status.elapsed,
    addedTime: raw.fixture.status.extra ?? null,
    scores: {
      halftime: raw.score?.halftime ?? null,
      fulltime: raw.score?.fulltime ?? null,
      extratime: raw.score?.extratime ?? null,
      penalty: raw.score?.penalty ?? null,
    },
    homeCode: initials(raw.teams.home.name),
    awayCode: initials(raw.teams.away.name),
    score: `${raw.goals.home ?? "—"} : ${raw.goals.away ?? "—"}`,
    status:
      raw.fixture.status.elapsed !== null && phase === "live"
        ? `${raw.fixture.status.elapsed}′`
        : raw.fixture.status.long,
    phase,
    color: "#4567AB",
    kickoff: raw.fixture.date,
    time: raw.fixture.date,
    source: "api-football",
  };
}
export class SportsError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}
export function createFootballService({
  key,
  fetchImpl = fetch,
  now = () => Date.now(),
  refreshSeconds = 1200,
  budget,
  timezone = "Africa/Nairobi",
}) {
  const interval = Math.max(15, Number(refreshSeconds) || 1200) * 1000;
  const cache = new Map();
  const pending = new Map();
  const status = () => ({
    configured: !!key,
    provider: "API-Football",
    refreshSeconds: interval / 1000,
    timezone,
  });
  const date = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(now()));
  async function load(path, params) {
    if (!key)
      throw new SportsError(
        "API-Football is not connected yet. The app owner needs to configure the sports service.",
        503,
      );
    const query = new URLSearchParams(params);
    const id = `${path}?${query}`;
    const saved = cache.get(id);
    if (saved && now() < saved.retryAt) return saved.payload;
    if (pending.has(id)) return pending.get(id);
    const request = (async () => {
      try {
        await budget.reserve();
        const response = await fetchImpl(
          `https://v3.football.api-sports.io/${id}`,
          {
            headers: { "x-apisports-key": key },
            signal: AbortSignal.timeout(12_000),
          },
        );
        if (response.status === 429)
          throw new SportsError(
            "The provider request limit has been reached. Updates are paused.",
            429,
          );
        if (!response.ok)
          throw new SportsError(
            "The sports provider could not return data. Please try again later.",
          );
        const body = await response.json();
        if (
          !body ||
          typeof body !== "object" ||
          !body.errors ||
          typeof body.errors !== "object" ||
          Object.keys(body.errors).length
        )
          throw new SportsError(
            "The provider denied this request. Check the key, quota, and season access in the API-Football dashboard.",
          );
        const fixtures = z
          .array(rawFixture)
          .parse(body.response)
          .map(normalizeFixture);
        const fetchedAt = new Date(now()).toISOString();
        const payload = {
          fixtures,
          fetchedAt,
          nextRefreshAt: new Date(now() + interval).toISOString(),
          stale: false,
          provider: "API-Football",
          timezone,
          date: params.date || new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(fixtures[0]?.kickoff || now())),
          refreshSeconds: interval / 1000,
          partial: Number(body.paging?.total || 1) > 1,
        };
        if (cache.size >= 50) cache.delete(cache.keys().next().value);
        cache.set(id, { payload, retryAt: now() + interval });
        return payload;
      } catch (error) {
        const message =
          error instanceof SportsError
            ? error.message
            : "Sports data could not be refreshed. Please try again later.";
        if (saved) {
          const payload = { ...saved.payload, stale: true, warning: message };
          cache.set(id, { payload, retryAt: now() + 60_000 });
          return payload;
        }
        throw error instanceof SportsError ? error : new SportsError(message);
      } finally {
        pending.delete(id);
      }
    })();
    pending.set(id, request);
    return request;
  }
  return {
    status,
    async fixtures(selectedDate = date()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
          !Number.isFinite(Date.parse(selectedDate)) ||
          new Date(selectedDate).toISOString().slice(0, 10) !== selectedDate)
        throw new SportsError("Choose a valid date in YYYY-MM-DD format.", 400);
      return load("fixtures", { date: selectedDate, timezone });
    },
    async fixture(id) {
      if (!/^\d{1,12}$/.test(id))
        throw new SportsError("Invalid fixture identifier.", 400);
      for (const entry of cache.values()) {
        const found = entry.payload.fixtures.find(
          (fixture) => fixture.id === id,
        );
        if (found && now() < entry.retryAt)
          return { ...entry.payload, fixtures: [found] };
      }
      return load("fixtures", { id, timezone });
    },
  };
}
