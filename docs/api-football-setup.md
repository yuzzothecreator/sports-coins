# API-Football integration

The selected provider is API-Football via API-Sports' direct dashboard. The app uses a server proxy; credentials never go in Expo public variables or client requests.

## Activate

1. Create the free account at https://dashboard.api-football.com/register and confirm your email. Find the key in Account → My Access. No account or subscription was created by the agent.
2. Put the key in the prepared, ignored `.env.server` file:

   ```text
   API_FOOTBALL_KEY=your-key
   API_FOOTBALL_DAILY_BUDGET=90
   API_FOOTBALL_REFRESH_SECONDS=1200
   ```

3. Restart Expo (`npm run web`) or the static preview (`npm run preview`). Both expose `/api/sports/*` on the same port as the app. Check `/api/sports/status`: `configured` should become true. This endpoint does not expose the key.
4. Open `/live`. It requests today's fixtures from `/fixtures?date=YYYY-MM-DD&timezone=Africa/Nairobi`. The interface filters those records locally and shows the source, check time, and refresh interval. Open a match to see the provider score and kickoff time. Missing statistics are explicitly unavailable.
5. Verify actual returned matches, season coverage, scores, and account quota before treating the integration as live-verified. The free plan restricts seasons; a valid key does not guarantee today's competitions are available. HTTP-200 responses with provider errors are displayed as errors, not empty fixtures or successful updates.

## Free-tier behavior

The advertised free allowance is 100 requests/day. The backend defaults to 90 requests/day, reserving room for other testing, and one provider refresh every 20 minutes. The browser checks the backend more often, but cached responses do not consume additional provider calls. Match details reuse cached feed records when available. No automatic retry is made after an initial error.

This is **not** a continuous 15-second feed. Upgrade/configure a larger budget before shortening the provider interval. Fifteen-second polling of just one endpoint around the clock consumes 5,760 requests/day before other endpoints. Actual provider delivery frequency can vary.

The backend maintains a persistent UTC-day request counter in `.runtime/football-budget.json`. Failed upstream attempts count too. A new process reads the counter; a corrupt/unwritable counter fails closed. In-flight calls and cached results are shared within one process. If refresh fails after a successful response, old records keep their original fetch time and are marked stale. Requests are never replaced with invented results.

## Development and hosting

- Web static preview: `npm run build:web -- --max-workers 2`, then `npm run preview`.
- Expo development: `npm run web` serves the sports endpoints through Node middleware in `metro.config.js`. Leave `EXPO_PUBLIC_SPORTS_API_URL` empty for same-origin web access. The middleware and preview share the same handler, cache, and persistent daily-budget implementation. Restart Expo after editing `.env.server`.
- Physical devices: set `EXPO_PUBLIC_SPORTS_API_URL` to a reachable backend URL. `localhost` on a phone points at the phone. For trusted-LAN development only, the backend accepts `HOST=0.0.0.0` in its server environment. Production needs an HTTPS backend deployment.
- The Node server uses `process.loadEnvFile` and targets the installed Node 24 runtime. A static-only host cannot run these API endpoints. Deploy the backend separately or on a Node-capable host; never publish `.env.server` or `.runtime`.
- Before horizontally scaling, replace the local counter/cache with a shared atomic store and add deployment-level abuse controls. The file counter is intentionally for one backend process.
- Provider match details use `/live?fixture=<provider-id>`, which works with the static web export without generating a page per match.

## Scope and verification

Authenticated verification on 2026-11-02 returned HTTP 200 with 269 provider fixtures. The key remains in the ignored server environment file. This verifies football fixture access; other sports, model predictions, and complete league/statistics coverage are not verified.

Home, Live Scores, and Predictions use provider-backed fixtures. Predictions allows personal match-result picks on scheduled matches before kickoff, without invented probabilities, odds, or bookmaker codes. Picks are screen-local and have no publication, settlement, or rewards. New picks pause if the feed is stale or refresh fails. The labelled sample demo is an explicit option on Live Scores. Other sports say “not connected”; this adapter does not use the football API for basketball, tennis, cricket, or hockey. Account/community connections still need the separate Supabase project details. Sample community, profile, and games screens require opening an explicit labelled preview. The app shell does not display fabricated member activity or balances.

Tests cover normalization, null scores, unknown statuses, cache/deduplication, secret-free responses, HTTP-200 API errors, invalid payloads/IDs, 429 handling, preserved stale timestamps, and restart-safe daily budgets. Synthetic test fixtures are never shipped as provider results. Real authenticated provider verification remains pending the user's key.

Official references: [API-Football guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [pricing](https://www.api-football.com/pricing), [documentation](https://www.api-football.com/documentation-v3).
