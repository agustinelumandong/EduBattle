## Migration Plan: World App MiniKit → Base MiniKit Auth

Goals

- Replace World App MiniKit (SIWE) with Base MiniKit Quick Auth / wallet auth using `@coinbase/onchainkit`(OCK) for MiniKit integration; `@base-org/minikit` is considered legacy and will not be used..
- Remove email/password login and register; support Guest name + “Connect Base” button.
- Keep gameplay and leaderboard functional for both guest and verified Base users.

References

- Base Mini Apps — Authentication: [docs.base.org/mini-apps/features/authentication](https://docs.base.org/mini-apps/features/authentication)
- Base Mini Apps — Build overview: [base.org/build/mini-apps](https://www.base.org/build/mini-apps)

Assumptions

- We’ll prefer `@coinbase/onchainkit/minikit` to match docs and get `useMiniKit` + `useAuthenticate`.
- Quick Auth issues a JWT we can verify on the server; we’ll keep wallet-sign flow optional for onchain actions.

Environment

- Add envs (names subject to library requirements, will finalize during implementation):
  - `NEXT_PUBLIC_BASE_APP_ID=`
  - `BASE_MINIKIT_JWT_PUBLIC_KEY=` (for server verification if using JWT)
  - `NEXT_PUBLIC_BASE_ENV=` (if required: `production`/`staging`)

---

### 1) Audit and remove World App MiniKit usages ✅ COMPLETED

- [x] Identify and replace imports from `@worldcoin/minikit-js` in:
  - `src/lib/auth.ts` ✅
  - `src/lib/auth-module.ts` ✅
  - `src/components/MinikitsProvider.tsx` ✅
  - `src/app/api/complete-siwe/route.ts` ✅ (deleted)
  - `src/app/layout.tsx` ✅
- [x] Remove SIWE-specific endpoints/logic:
  - `src/app/api/nonce/route.ts` ✅ (deleted)
  - `src/app/api/complete-siwe/route.ts` ✅ (deleted)
- [x] Remove or gate references to MiniKit user from World App in UI/components ✅

Deliverable: code compiled without World App MiniKit references ✅

### 2) Install and configure Base MiniKit provider

- [ ] Add dependency: `@coinbase/onchainkit` (or `@base-org/minikit` if we switch; default: OCK).
- [ ] Wrap app with MiniKit provider in `src/app/layout.tsx`:
  - Import `{ useMiniKit, useAuthenticate, AuthenticateProvider }` per OCK docs.
  - Initialize provider with `NEXT_PUBLIC_BASE_APP_ID`.
- [ ] Expose context via lightweight local provider if needed by existing components.

Deliverable: provider mounted; `useMiniKit` returns `context`, `useAuthenticate` returns `user`.

### 3) Client auth: Quick Auth + context

- [ ] Implement a small hook `useBaseAuth()` that returns `{ verifiedUser, contextUser, isLoading, signIn, signOut }` using OCK `useAuthenticate`.
- [ ] Use context (`useMiniKit().context`) strictly for analytics, not auth (per docs).
- [ ] Persist Quick Auth session (JWT) in `localStorage` or cookie (httpOnly if set server-side) and auto-restore on load.

Deliverable: components can access a verified user (SIWF/Quick Auth) or be guest.

### 4) Server verification endpoint (Quick Auth JWT / wallet signature)

- [ ] Create `src/app/api/auth/base/verify/route.ts`:
  - Accept Quick Auth JWT (or signed payload) from client.
  - Verify JWT signature using BASE_MINIKIT_JWT_PUBLIC_KEY (retrieved from Base docs). If JWT fails verification or is expired, fallback to guest mode. For onchain actions (minting, tx submission), require wallet signature verification (useSignMessage) as an extra layer of trust.
  - Return a session cookie or a short-lived server token for APIs.
- [ ] Update middleware/util to read the verified identity for protected actions.

Deliverable: secure verification path for Base-issued auth.

### 5) Replace login/register with Guest + Connect Base

- [ ] Remove UI for email/password forms:
  - `src/components/ui/EmailLoginForm.tsx` (and usages)
  - Any pages that render login/register.
- [ ] Add a lightweight component (e.g., `src/components/ui/ConnectBase.tsx`):
  - Guest name input (required, stored client-side and sent to server on record/leaderboard).
  - “Connect Base” button triggers `useAuthenticate()` flow.
  - Show connected state (fid/address/username) when verified.
- [ ] Update `src/app/page.tsx` or HUD to surface guest name and connect button.

Deliverable: single entry point with Guest + Connect Base; no email/password.

### 6) Database updates

- [ ] Add fields to `User` model in Prisma:
  - `baseFid` (Int or String depending on SDK)
  - `walletAddress` (String)
  - `authProvider` (enum: `guest` | `base`)
  - Mark `passwordHash` optional/nullable or remove if unused.
- [ ] Migration + seed adjustments.
- [ ] Backfill or lazy-create user rows on first verify or first score submit.

Deliverable: schema supports guest and Base users without passwords.

### 7) API updates for game/leaderboard

- [ ] `src/app/api/game/record/route.ts`:
  - Accept either guest name or verified Base identity from request/session.
  - Normalize to a `userId` (create guest or base user if missing) and store.
- [ ] `src/app/api/leaderboard/route.ts`:
  - Display entries for both guest and base users; show name preference: verified username → guest name.

Deliverable: gameplay and leaderboard work for both auth states.

### 8) Remove legacy email auth APIs and routes

- [ ] Deprecate or delete endpoints:
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/verify/route.ts`
  - `src/app/api/auth/wallet-register/route.ts` (if tied to old flow)
- [ ] If keeping temporarily, return `410 Gone` with guidance.
- [ ] Remove links/buttons to old auth.

Deliverable: no email/password code paths remain.

### 9) Session persistence and refresh

- [ ] Store Quick Auth JWT securely; auto-restore on app load.
- [ ] Handle token expiration and silent re-auth if supported.
- [ ] Fallback to guest gracefully when not verified.

Deliverable: stable session UX across reloads.

### 10) Documentation and environment

- [ ] Update `ENVIRONMENT_SETUP.md` with Base MiniKit steps and required env vars.
- [ ] Update `README.md` with the new auth flow and screenshots.
- [ ] Add `.env.example` entries for Base.

Deliverable: contributors can run with Base auth quickly.

### 11) Testing checklist

- [ ] Guest play without connecting; record score; appears on leaderboard.
- [ ] Connect Base; session persists; record score; user is attributed to Base identity.
- [ ] Switching from guest to Base merges/associates scores correctly.
- [ ] Build on Vercel succeeds; no unused imports from World App SDKs.
- [ ] Verify that context is not used for primary auth (analytics only).

---

Notes

- Gate wallet only at onchain actions; prefer Quick Auth for low-friction identity; use cryptographic verification for security-critical operations, per Base guidance.
