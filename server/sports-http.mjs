import { SportsError } from "./football.mjs";

export function createSportsHandler(football, allowedOrigin) {
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (allowedOrigin && req.headers.origin === allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" }).end();
      return;
    }
    try {
      let data;
      if (url.pathname === "/api/sports/status") data = football.status();
      else if (url.pathname === "/api/sports/fixtures")
        data = await football.fixtures();
      else if (url.pathname === "/api/sports/fixture")
        data = await football.fixture(url.searchParams.get("id") || "");
      else throw new SportsError("Sports endpoint not found.", 404);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(error instanceof SportsError ? error.status : 500, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({
        error: error instanceof SportsError ? error.message : "Sports service unavailable.",
      }));
    }
  };
}
