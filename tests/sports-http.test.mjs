import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { createSportsHandler } from "../server/sports-http.mjs";
import { createFootballService } from "../server/football.mjs";

test("HTTP endpoints report missing credentials without invented fixtures", async (t) => {
  const service = createFootballService({ budget: { reserve: async () => {} } });
  const server = createServer(createSportsHandler(service));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/sports`;
  const status = await fetch(`${base}/status`);
  assert.equal(status.status, 200);
  assert.equal((await status.json()).configured, false);
  const fixtures = await fetch(`${base}/fixtures`);
  assert.equal(fixtures.status, 503);
  assert.match((await fixtures.json()).error, /not connected/);
  assert.equal(fixtures.headers.get("cache-control"), "no-store");
  assert.equal((await fetch(`${base}/unknown`)).status, 404);
  const write = await fetch(`${base}/fixtures`, { method: "POST" });
  assert.equal(write.status, 405);
  assert.equal(write.headers.get("allow"), "GET");
});
