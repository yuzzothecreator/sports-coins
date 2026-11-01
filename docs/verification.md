# Milestone 1 verification

Verified on 1 November 2026.

- `npm run typecheck`: passed.
- `npm run lint`: passed, zero warnings.
- `npx expo install --check`: dependencies up to date.
- `npm run build:web -- --max-workers 2`: passed, 16 static routes including all five sample match details.
- Local Community HTTP response: 200.
- Browser, 390 × 844: phone layout, six-destination navigation, post composition, and reaction controls inspected.
- Browser, 1440 × 1000: sidebar, community panel, club circles, and groups layout inspected.
- Created a demo post and liked it; both survived reload.
- Added a prediction, generated `SC-DEMO-1`, and verified the copy success state.
- Opened Football Fanatics and sent a device-local message; message appeared in the room.
- Answered trivia correctly: balance increased from 1,250 to 1,350 and answers became disabled.
- Claimed daily reward: balance increased to 1,400; both daily claim controls became disabled.
- Opened a sample football match and refreshed its detail URL successfully.

Screenshots: `mobile-preview.jpg`, `desktop-preview.jpg`. Screenshots include device-local verification activity; they are not live sports data.

Not verified: physical iOS/Android devices, connected Supabase authentication, PostgreSQL migration execution/RLS, real providers, real-time shared data, push notifications, production rewards, or deployment.

The Expo ESLint wrapper incorrectly rejected the installed ESLint version. The project lint script uses ESLint directly and passes. Browser attachment initially failed; opening the preview with the Codex panel resolved it.

## Premium visual refinement

- Lint, TypeScript, Expo dependency compatibility, and web export passed after the typography/theme changes.
- All six bundled font assets returned HTTP 200. Browser heading computed style resolves to `Manrope_700Bold`; font-face declarations include all Inter and Manrope variants.
- Inspected Home at 360 × 800, Live Scores at 390 × 844 and 1440 × 1000, and Profile at 360 px. No horizontal document overflow in the checked phone layouts, including Predictions.
- Verified football/basketball/tennis switching, upcoming-match filtering, search empty state, and navigation to Community Friends and Predictions.
- Screenshots: `premium-live-mobile.jpg` and `premium-live-desktop.jpg`.
- Shared text/input wrappers, fixed font weights, tokenized colors/radii, compact section headings, focus/press feedback, and larger navigation targets reviewed. No backend behavior changed.
- Physical-device visual verification remains outstanding.

## Accounts and shared community wiring

- Lint, TypeScript, dependency compatibility, and web export passed with the new account route/session provider.
- `npm test`: 12 passing checks. Actual migrations run against PGlite/PostgreSQL-WASM with simulated Supabase Auth identities.
- Verified two-user profile creation, owner-only profile changes, shared posting/replies, private bookmarks, non-spoofable likes/follows, blocked coin writes, immutable profile identity/join time, database posting limits, and owner-only post deletion.
- Quota history remains after deletion; deleting a post cannot reset the rate limit.
- Browser: empty sign-in/signup validation works, demo/profile navigation still works, and `/account` clearly reports an unconfigured service. No credentials were sent.
- Hosted Auth, email delivery, PostgREST embedding, session switching, and live two-user browser tests remain pending the new project details.
- The user explicitly selected a different project. No schema, settings, credentials, or data were changed on the existing connected project.
