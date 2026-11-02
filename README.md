# Sport Coins

Predict. Play. Connect.

## Current data status

Update 2026-11-02: API-Football authentication succeeded and returned 269 fixtures for today. The server key is configured in the ignored `.env.server`. Supabase project `oaualaaqnopgozzaipgv` was selected and its URL saved in the ignored `.env`, but the connector denied access to that project and its publishable key is still missing. Accounts/community activation remains blocked on that access.

Real sports data is not activated until `API_FOOTBALL_KEY` is configured in the ignored `.env.server` file. Expo and the static preview now share `/api/sports/*` endpoints; no separate web backend process is needed during Expo development. Home, Live Scores, and Predictions use the provider feed. Predictions has personal match-result picks, with no invented probabilities or bookmaker codes. Earlier demo slip behavior described below has been replaced.

Community and profiles require the separate Sport Coins Supabase project; the existing connected finance project must not be reused. Sample community/profile/game screens are opt-in labelled previews. Rewards and real leaderboards remain unconnected. The shell shows a guest identity and unavailable rewards instead of fabricated account data. See `docs/account-setup.md` and `docs/api-football-setup.md` for activation. Provider-authenticated verification is still pending credentials.

Expo SDK 58 / React Native / TypeScript application for Android, iOS, and web. This first milestone follows the supplied light community reference: white surfaces, navy typography, thin borders, club circles, and responsive navigation.

The visual system pairs bundled **Manrope** headings with **Inter** body text, a deep navy / warm gold palette, softly elevated cards, and consistent type weights across native and web. Fonts load from bundled assets with no Google Fonts network request. Shared typography and input components apply the system throughout the app. Home and Live Scores feature navy panels; Live Scores includes sport chips, segmented status filters, and a featured demo match. This is a coordinated light theme; a user-selectable dark mode remains a future milestone. Font licenses are included in `docs/font-licenses/`.

## Run

```sh
npm ci
npm start
```

Use a compatible Expo Go or a development build. `npm run android` opens an Android emulator; iOS simulator builds require macOS. Browser preview:

```sh
npm run web
```

Visit Expo's printed local URL. `/community` most closely matches the design reference. The root is the dashboard. Onboarding is available through “How Sport Coins works”.

```sh
npm run typecheck
npm run lint
npm test
npm run build:web -- --max-workers 2
npm run preview
```

Web output is in `dist/`. No native build has been verified on a physical device.

## Implemented

- Desktop sidebar and six-destination mobile bottom navigation.
- Home dashboard, sports selection, fixtures, match details, and sample statistics.
- Community feed with search/club/following filters, posts, likes, bookmarks, and session-local replies.
- Groups, device-local messages, friend discovery, and following.
- Prediction slip selections, deterministic demo codes, clipboard copying, and sharing.
- Free trivia, daily check-ins, practice score predictions, and sample leaderboards.
- Demo profile, three-step onboarding, notification status dialog, and validated account forms.
- Supabase-backed session handling, account/profile creation and editing, and connected posts/replies/likes/bookmarks/follows when a project is configured.
- Sports-provider contract, database migrations, and ownership/rate-limit tests.
- API-Football server adapter, cached provider-backed Home/Live Scores, source/freshness states, and persistent quota protection. Activation still needs the user's API key; see `docs/api-football-setup.md`.

Without a configured Supabase project, posts, likes, bookmarks, follows, selected picks, messages, trivia completion, and demo coins persist through AsyncStorage/Zustand. Demo replies and practice scores last for the screen/session. Daily rewards use the device date. Trivia is one sample question, once per device state, without a timer. A correct answer earns 100 demo coins; an incorrect answer earns none. Daily check-in earns 50. Opening balance is 1,250. Reset site storage/app data to restart. Configured community data uses Supabase and is never populated from the demo store.

## Structure

```text
src/app/                    Expo Router screens and responsive shell
src/components/ui.tsx       Shared typography, controls, cards, and fixtures
src/theme.ts                Light visual tokens
src/data/demo.ts            Explicitly illustrative data
src/store/use-app.ts         Device-local demo state
src/lib/supabase.ts          Optional publishable-key client
src/features/account/       Session, profile validation, persistence, and editor
src/features/community/     Connected feed, replies, reactions, and following
src/services/               Provider abstraction foundation
supabase/migrations/        Initial schema and access policies
```

Styling uses React Native StyleSheet/shared tokens. NativeWind, dark theme, and animation polish are deferred. Reanimated/Gesture Handler are installed through Expo. React Hook Form and Zod validate account inputs. TanStack Query manages connected profiles/community and provider data. Home and Live Scores now default to the backend API; missing credentials show a connection state, never sample scores. A labelled demo is explicitly selectable on Live Scores.

## Optional Supabase

Copy `.env.example` to `.env` and add your project URL and **publishable** key. Restart Expo after changes. Never put service-role keys, database passwords, or sports-provider secrets in `EXPO_PUBLIC_*` variables.

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EXPO_PUBLIC_AUTH_REDIRECT_URL=http://localhost:8081/auth
```

With a configured project and applied migrations, account forms call Supabase Auth, restore sessions, and direct members to create or edit a persistent public profile. Email confirmation depends on project settings. Add the configured redirect to the project's Auth redirect allowlist. Native users can confirm by email and return to sign in; native confirmation deep links are not implemented yet. Sign-out clears account-scoped query caches and drafts. The connected Community shows actual public profiles/posts/replies, likes, private bookmarks, and following; it does not mix in sample fans. It polls the feed every 30 seconds and open replies every 15 seconds. Scores, predictions, games, chat rooms, and balances remain demo/unconnected features. Without configuration, credentials are not transmitted or persisted. See `docs/account-setup.md`.

The migration prepares profiles, sports, competitions, teams, fixtures, posts, comments, likes, bookmarks, follows, slips/selections, rooms/membership/messages, and coin accounts/transactions. All tables enable RLS with explicit grants. Social writes enforce ownership; private slips and bookmarks have restricted reads; coin records are owner-readable. Fixture, slip, room, message, and coin writes are server-only. No balance-changing RPC is exposed.

The CLI generated `supabase/config.toml` and the migrations. The migrations run in the PGlite PostgreSQL/WASM test engine with simulated Supabase auth roles/UIDs; ownership, grants, constraints, and two-user posting/replies pass. Database posting limits allow five posts and twenty replies per minute and retain append-only quota records after a post is deleted. The private quota schema must stay outside the Data API. Migrations have **not** been applied to a hosted Supabase project. Real Auth/email confirmation, PostgREST embedding, and device-session tests await the selected project's details. Local full-stack Supabase requires Docker, which is not available here.

## Remaining milestones

- Connect the selected Supabase project and verify live signup → profile → post → second-user reply. Add password recovery, private-profile settings, native confirmation links, and hardened native token storage.
- Activate and live-verify the API-Football backend using the user's key. Add the other sport adapters and production hosting/shared caching. The free-tier default refresh interval is 20 minutes, not continuous live polling.
- Statistical prediction snapshots, evaluation, and server-enforced kickoff locks. Sample probabilities have no measured accuracy.
- Server-owned slip publication/import, immutable selections, and shareable images. Demo codes are local selection identifiers, not bookmaker codes.
- Uploads, moderation, blocks, reports, and Realtime chat. Basic public social data and posting rate limits are implemented; chat tables deny client writes until moderation endpoints exist. Public social writes should not be broadly released until moderation/reporting is added.
- Atomic idempotent server reward ledger and validated game submissions. Device-local coins must never become production balances.
- Remaining brief entities: players, events/statistics, preferences/favorites, models/results, games/submissions, achievements, notifications, reports, leaderboard snapshots.
- Push notifications, secure admin tools, offline handling, dark theme, physical-device and accessibility testing.

Coins cannot be purchased, transferred, withdrawn, or redeemed. All scores, statistics, probabilities, and rankings are samples. No bookmaker integration exists.

## Verification

TypeScript, ESLint (zero warnings), Expo dependency compatibility, and the web export passed. Twelve automated checks cover profile/content validation and PostgreSQL/WASM ownership, two-user posts/replies, private bookmarks, rate limits, deletion, and blocked coin writes. Earlier browser checks verified demo post composition, likes, slip generation/copying, local chat, trivia, and duplicate claims. Mobile and desktop layouts were inspected. Hosted Supabase Auth/PostgREST and native-device checks remain outstanding. ESLint runs directly because the Expo lint wrapper rejected the installed compatible ESLint version.

`npm audit --omit=dev` reported 12 moderate findings inherited through Expo build tooling (`glob`/`minimatch` and dependents), no high or critical findings. Installing ESLint increased the full development-tree count to 25 moderate findings. Suggested automatic fixes include incompatible Expo downgrades and were not applied. Recheck with compatible tooling patches before production.

References: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo Router](https://docs.expo.dev/router/introduction/), [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native).
