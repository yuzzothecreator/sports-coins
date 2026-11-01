# Connect accounts and community

The user selected a **different Supabase project** from the existing connected one. No changes were made to the existing project. The app is ready for the new project's reference/URL and publishable key; do not reuse another project's credentials.

## Setup sequence

1. Identify the intended development project, inspect its tables and migrations, and confirm it is suitable for Sport Coins. Do not apply the initial migration over unrelated existing tables.
2. Apply the two tracked migrations in order. Keep `private` out of the Data API's exposed schemas. All public tables have RLS with explicit grants.
3. Copy `.env.example` to `.env`. Set the project URL and **publishable** key. Do not supply a service-role key to Expo. Set `EXPO_PUBLIC_AUTH_REDIRECT_URL` to the browser app's `/auth` URL and add it to Supabase Auth's redirect allowlist. The current static preview uses `http://localhost:8081/auth`.
4. Keep email confirmation enabled for a hosted project. Confirm mail delivery/provider settings. The native flow currently asks the member to confirm email and then return to sign in; native confirmation deep links are a later task.
5. Restart Expo, or rebuild the web export and restart/refresh the preview. Public environment variables are compiled into the bundle.
6. Sign up as a test member, confirm email, sign in, create a public profile, and publish a post. Sign in as a second test member in another browser/device, create another profile, and reply. Refresh as the first member and verify both authors and the reply. Refresh restores the session; sign-out clears account-specific caches and form drafts.
7. Run hosted security advisors, address relevant findings, and test the actual PostgREST relationship queries before widening access.

## Implemented account behavior

- Auth loading/error states, persisted sessions, identity-aware shell, sign-out.
- Explicit profile provisioning after authentication, avoiding an Auth trigger that could block signups if profile setup fails.
- Lowercase unique username, display name, and biography validation.
- Profiles contain public fields only; account email comes from Auth and is never written to a public profile.
- Public reading of the feed and replies. Publishing requires a signed-in member with a profile.
- Shared posts and replies, likes, owner-private bookmarks, following, and deletion of one's own posts with confirmation.
- Visible errors and retry controls. No fake success or fallback to demo data when a configured backend fails.
- Feed polling every 30 seconds; open replies every 15 seconds. Feed shows latest 50 posts; threads show latest 100 replies.
- PostgreSQL enforces ownership, nonblank content, and five posts / twenty replies per minute. An append-only private quota table prevents bypass by deleting posts. A trusted maintenance task can prune old quota records; no client has reset/delete permission.

## Verification completed / remaining

`npm test` executes validation tests plus actual migrations against PGlite (PostgreSQL compiled to WASM). Supabase Auth's roles and `auth.uid()` are simulated only for these tests. The tests exercise a first author and a second replier, private bookmarks, forbidden impersonation, forbidden account/profile changes, coin-write rejection, rate limits, and ownership of deletion.

These tests do **not** verify the hosted Auth service, email delivery, actual user JWTs, PostgREST relationship embedding, token revocation, cross-tab sign-out, or physical iOS/Android devices. Those checks require the new project. Native sessions currently use AsyncStorage, as in the initial foundation; encrypted native session storage must be completed before production release. Moderation/reporting, uploads, private profiles, shared rooms, Realtime subscriptions, production rewards, and provider data are still future milestones.
