const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const previous = config.server.enhanceMiddleware;
// Both Expo development and the production preview expose the same Node API.
const sports = import("./server/sports-runtime.mjs");
config.server.enhanceMiddleware = (middleware, server) => {
  const next = previous ? previous(middleware, server) : middleware;
  return (req, res, ...args) => {
    if (req.url?.startsWith("/api/sports/")) {
      void sports.then(({ sportsHandler }) => sportsHandler(req, res)).catch(() => {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Sports backend could not start. Check the server configuration." }));
      });
      return;
    }
    return next(req, res, ...args);
  };
};
module.exports = config;
