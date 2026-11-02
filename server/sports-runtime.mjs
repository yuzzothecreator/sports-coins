import { resolve } from "node:path";
import { createFootballService } from "./football.mjs";
import { createBudget } from "./budget.mjs";
import { createSportsHandler } from "./sports-http.mjs";

// Imported by Node only. Never import this module into the application bundle.
try {
  process.loadEnvFile(".env.server");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const football = createFootballService({
  key: process.env.API_FOOTBALL_KEY,
  refreshSeconds: process.env.API_FOOTBALL_REFRESH_SECONDS,
  budget: createBudget({
    file: resolve(".runtime/football-budget.json"),
    limit: Math.max(1, Number(process.env.API_FOOTBALL_DAILY_BUDGET) || 90),
  }),
});
export const sportsHandler = createSportsHandler(football, process.env.SPORTS_ALLOWED_ORIGIN);
