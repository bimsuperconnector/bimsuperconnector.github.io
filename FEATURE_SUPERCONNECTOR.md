# SuperConnector --- Phase-by-Phase Implementation Plan

## Product objective

A private alumni ecosystem where verified BIM alumni maintain a
professional identity, discover each other, network monthly, find jobs,
advertise ventures, attend events and communicate through controlled
alumni segments.

## Phase 0 --- Foundation & setup

**Status: COMPLETE** (marked 2026-09-05)

Create maintainable PWA structure, TypeScript, lint/format/test tooling,
Firebase project, Google Sign-In, Firestore, restrictive security
baseline, GitHub repository/Pages deployment, PWA manifest/service
worker, legal routes. Claude must guide the owner step-by-step from
account creation through first deployment. Acceptance: local app works,
Firebase connects, auth/protected-route architecture exists, GitHub
Pages deployment works.

### Acceptance criteria --- verified 2026-09-05

- **Local app works** --- VERIFIED. `npm run dev`, `npm run build`, and
  `npm run preview` all succeed; the production build was served locally
  and its PWA manifest confirmed reachable (HTTP 200).
- **Auth/protected-route architecture exists** --- VERIFIED. `AuthContext`
  (Google Sign-In via Firebase Auth) + `ProtectedRoute` guard implemented;
  covered by `ProtectedRoute.test.tsx` (3/3 passing: loading, signed-out
  redirect to `/login`, signed-in render).
- **GitHub Pages deployment works** --- VERIFIED LIVE. GitHub Actions run
  "Deploy to GitHub Pages #7" (commit `4d10422`) shows Status: Success ---
  `build` job 32s, `deploy` job 8s, `github-pages` artifact produced
  (637 KB). Confirmed by directly fetching
  `https://bimsuperconnector.github.io/`: HTML head matches the built
  source exactly (title "SuperConnector", correct meta description),
  served at the repo root as expected for a `<username>.github.io`
  user-page repo. Remaining Actions annotations are informational only
  (GitHub's Node-20 actions-runtime deprecation notice, and the known
  oxlint fast-refresh warning below) --- no errors.
- **Firebase connects** --- VERIFIED structurally, PARTIALLY VERIFIED live.
  Owner created Firebase project `bim-superconnector`, registered a Web
  app, enabled the Google sign-in provider, created a Firestore database,
  and published the deny-all baseline rules via the Firebase Console. The
  six `VITE_FIREBASE_*` values are stored as GitHub Actions repository
  secrets and consumed by `src/services/firebase/firebase.ts`. The live
  production build (run #7 above) succeeded using those real secrets,
  which would fail or embed placeholder values if they were absent --- so
  the wiring is confirmed. **Not independently confirmed:** Claude has no
  browser-automation tool in this environment and could not click through
  an actual "Sign in with Google" popup on the live site. The owner should
  do one real sign-in on `https://bimsuperconnector.github.io/` as final
  human confirmation of this criterion.

### Implementation

- Vite + React + TypeScript PWA scaffold, restructured to match
  `ARCHITECTURE.md`'s suggested layout (`app/`, `pages/`, `layouts/`,
  `features/*`, `services/{firebase,calendar,groups}`,
  `domain/matching/*`).
- `src/services/firebase/firebase.ts`: Firebase app/auth/Firestore
  initialization reading config only from `VITE_FIREBASE_*` env vars; no
  secrets in source. Fails loudly (console error) if any config value is
  missing.
- `src/features/auth/AuthContext.tsx`: React context wrapping
  `onAuthStateChanged`, `signInWithPopup` (Google provider only, no
  passwords collected), and sign-out.
- `src/app/ProtectedRoute.tsx`: route guard, explicitly documented as a
  UX convenience, not the security boundary --- Firestore rules are.
- Routes wired in `src/app/App.tsx`: Landing (`/`), Login (`/login`),
  Terms (`/terms`), Privacy (`/privacy`, both placeholder content per
  `LEGAL.md`, linked from footer and login page), Dashboard (`/dashboard`,
  protected placeholder).
- Baseline accessible CSS (`src/index.css`): visible focus states, 44px
  minimum touch targets, `prefers-reduced-motion` support --- deliberately
  not a design system, since `Design-superconnector.md` has not been
  supplied.
- PWA manifest + service worker via `vite-plugin-pwa`, configured with
  **no runtime caching rules**, so Firebase Auth/Firestore traffic is
  never cached by the service worker (per `SECURITY_AND_TESTING.md`).
- Placeholder PWA icons (192/512/apple-touch), clearly marked as
  placeholders pending real design.
- `firebase/firestore.rules`: deny-all baseline (`allow read, write: if
  false` at `/{document=**}`), with comments directing future phases to
  scope it narrowly per collection instead of loosening it.
- `.github/workflows/ci.yml` (format/lint/typecheck/test/build on every
  push/PR) and `.github/workflows/deploy.yml` (same checks + real build +
  GitHub Pages publish on push to `main`).

### Files

```
src/app/{App.tsx, ProtectedRoute.tsx, ProtectedRoute.test.tsx}
src/pages/{LandingPage,LoginPage,TermsPage,PrivacyPage,DashboardPage}.tsx
src/layouts/RootLayout.tsx
src/features/auth/AuthContext.tsx
src/services/firebase/firebase.ts
src/{main.tsx, index.css, vite-env.d.ts}
src/tests/setup.ts
firebase/{firestore.rules, firestore.indexes.json, firebase.json, .firebaserc.example}
.github/workflows/{ci.yml, deploy.yml}
index.html, vite.config.ts, package.json, package-lock.json,
  tsconfig{,.app,.node}.json, .env.example, .gitignore, .oxlintrc.json,
  .prettierrc.json, .prettierignore, README.md
public/{pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png}
Empty scaffold folders (.gitkeep only, no files yet): src/components,
  src/features/{onboarding,profiles,directory,connector,jobs,openToWork,
  entrepreneurship,events,admin,notifications,legal},
  src/services/{calendar,groups}, src/domain/matching/*
```

### Firebase / Google / GitHub configuration

- Firebase project: `bim-superconnector` (Spark/no-cost plan)
- Web app registered; config values stored as GitHub Actions secrets
  (not committed to the repo)
- Authentication → Google sign-in provider enabled; support email
  `bimaasuperconnector@gmail.com`
- Google Cloud OAuth consent screen (project `bim-superconnector`)
  published to production, so any Google account can sign in, not just
  a 100-user test list --- only default non-sensitive scopes are requested
- Firestore (Native mode) created; deny-all rules published via the
  Firebase Console's Rules editor (no Firebase CLI used)
- Authorized domain `bimsuperconnector.github.io` added in Authentication
  → Settings
- GitHub repo: `bimsuperconnector/bimsuperconnector.github.io` (public;
  this exact name makes it a GitHub *user site*, served at the domain
  root rather than a `/repo-name/` subpath)
- Pages source: GitHub Actions (Settings → Pages)
- Repository secrets: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- Repository variable: `VITE_BASE_PATH` = `/` (required override --- see
  Decisions)
- `actions/setup-node` pinned to Node.js 22 in both workflows (see
  Decisions)

### Tests

- Vitest + Testing Library configured (`vite.config.ts` `test` block,
  `src/tests/setup.ts`)
- `ProtectedRoute.test.tsx`: 3 tests, all passing (loading state,
  signed-out redirect, signed-in render)
- `npm run format:check` (Prettier), `npm run lint` (oxlint --- 0 errors,
  1 informational warning), `npm run typecheck` (`tsc -b`), and
  `npm run build` all pass, both locally and in the live
  `deploy.yml` run (#7, Success)

### Known issues / deferred work

- Main JS bundle is ~700 KB (mostly the Firebase SDK) --- not code-split;
  acceptable for Phase 0, worth revisiting once more features land.
- No visual design applied --- `Design-superconnector.md` still has not
  been supplied by the owner.
- Google Calendar/Meet, Google Groups, and Firebase Storage are
  intentionally not configured yet (later phases).
- `oxlint` reports one informational warning (fast-refresh export rule on
  `AuthContext.tsx`'s `useAuth` hook) --- expected for the
  context-plus-hook-in-one-file pattern; not an error, does not block CI.
- GitHub Actions shows informational "Node.js 20 is deprecated" notices
  on `actions/checkout@v4`, `actions/setup-node@v4`,
  `actions/upload-artifact@v4`, `actions/deploy-pages@v4` --- this is
  GitHub's own action-runtime notice (unrelated to the `node-version: 22`
  we set for running `npm` scripts) and needs no owner action.
- Live interactive Google Sign-In has not been click-tested by Claude (no
  browser-automation tool available here) --- see Acceptance criteria above.
- `.env.example` was not confirmed present after the manual web upload;
  it's a local-dev-only reference file and does not affect the deployed
  build (which reads secrets from GitHub Actions, not `.env`).

### Decisions

- Files were uploaded via GitHub's web UI (no local git/terminal), per
  owner preference. Critical dotfiles (`.github/workflows/*`,
  `.oxlintrc.json`, `.prettierrc.json`, `.gitignore`) were created
  individually via "Create new file" since OS-level hidden-file
  drag-and-drop is unreliable.
- Because the repo is named `bimsuperconnector.github.io` (a GitHub user
  site), it serves from the domain root, not `/repo-name/`. Rather than
  relying on the workflow's `/<repo-name>/` fallback default,
  `VITE_BASE_PATH` is set explicitly to `/` via a repository variable.
- Node.js was bumped from 20 → 22 in both workflows after a real CI
  failure: `TypeError: webidl.util.markAsUncloneable is not a function`,
  caused by `undici` (a `jsdom`/test-environment dependency) calling a
  Node API only available from Node.js v21 onward. Root-caused and fixed
  2026-09-05; confirmed Node 22 exports the required API.
- Visual design work is deferred in full, not partially applied --- no
  colors/typography/spacing decisions were invented in the absence of
  `Design-superconnector.md`.

### Next phase

Phase 1 --- Authentication & onboarding.

## Phase 1 --- Authentication & onboarding

**Status: COMPLETE** (implemented 2026-09-06)

Google Sign-In → profile/application → pending → batch
moderator/application admin review → approved/rejected → portal. Collect
name, photo, BIM batch/years, location, education, current/previous
employment and roles, startup/ownership marker, skills/interests and
networking fields. Compress/resize photo before storage. Acceptance:
unauthorized/pending users cannot access private portal; approval is
enforced by rules.

### Acceptance criteria --- status as of 2026-09-06

- **Unauthorized/pending users cannot access private portal** ---
  VERIFIED locally, in code and by test. `PortalRoute` gates `/dashboard`
  and `/review` on an approved role read from `/users/{uid}`; a person
  with no application, a pending application, or a rejected application
  is redirected to `/onboarding` instead. Covered by
  `PortalRoute.test.tsx` (5/5 passing) and `ReviewerRoute.test.tsx`
  (3/3 passing).
- **Approval is enforced by rules, not just UI** --- IMPLEMENTED,
  UNVERIFIED BY EXECUTION IN THIS ENVIRONMENT. `firebase/firestore.rules`
  replaces the Phase 0 deny-all baseline with real least-privilege rules
  (see Security section below) and `tests/firestore/rules.test.ts`
  exercises them (20 test cases: unauthenticated denial, self-service
  create, pending-user denial, approved access, rejected-user
  resubmission, admin permissions, batch-moderator scope). These require
  the Firestore emulator, which requires downloading a JAR from
  `storage.googleapis.com` on first run — that domain is outside this
  sandbox's network allowlist, so I could not execute them here. I
  confirmed the *exact* and *only* failure is that network block (Java
  is present; the emulator CLI reaches the point of trying to fetch the
  emulator binary and stops there). I added a "Firestore rules tests"
  step to both `ci.yml` and `deploy.yml` using `actions/setup-java` +
  `firebase emulators:exec`, which has unrestricted network access, so
  **the owner's next push is the real confirmation of this criterion**
  — the same pattern Phase 0 used for the live Google Sign-In
  click-test it couldn't run in-session either.

### Implementation

- **Role model** (`src/domain/onboarding/roles.ts`): the seven roles
  from CLAUDE.md (`pending`, `rejected`, `member`, `batchModerator`,
  `applicationAdmin`, `platformAdmin`, `superAdmin`) as a string union
  (not a TS `enum` — `erasableSyntaxOnly` is on in `tsconfig.json`),
  plus `isAdminRole`/`isReviewerRole`/`isApprovedRole`/`canReviewBatch`
  helpers used by both the UI and (by hand-kept parity, since they run
  in different languages) `firebase/firestore.rules`'s own
  `isAdminRole`/`canReview`.
- **Firestore schema** (`src/domain/onboarding/types.ts`):
  - `/users/{uid}` --- the protected account/role record: `uid`, `email`,
    `displayName`, `batchId`, `role`, and (reviewer-decision only)
    `assignedBatches`, `rejectionReason`, `reviewedBy`, `reviewedAt`.
    `role` is the single protected authorization field. `batchId` is a
    deliberate denormalized copy of the profile's batch, written once
    and frozen after creation, so a batch moderator's review-queue query
    can filter `role == 'pending' && batchId in [...]` in one query
    without needing a `/profiles` list permission.
  - `/profiles/{uid}` --- the owned application/profile content: name,
    photo, batch, normalized location, education, current/previous
    organizations (with startup markers), skills, interests, networking
    goals. Create-only from the client in Phase 1 (see Decisions).
- **Onboarding UI** (`src/features/onboarding/`): `ApplicationForm.tsx`
  (all required fields, Add More for previous organizations, client-side
  photo validation + compression), `OnboardingPage.tsx` (the single hub
  that shows the form / pending banner / rejected banner+resubmit /
  redirects to `/dashboard` once approved, driven by a real-time
  `onSnapshot` subscription via `useUserRecord.ts`), `ApplicationStatus.tsx`.
- **Review UI** (`src/features/review/ReviewQueuePage.tsx`): lists
  pending applications scoped to the reviewer's authority (all of them
  for admin roles, assigned-batch-only for `batchModerator`), opens full
  application detail on demand, and approves/declines with an optional
  reason.
- **Route guards** (`src/app/PortalRoute.tsx`, `src/app/ReviewerRoute.tsx`):
  new components composed on top of the existing Phase 0
  `ProtectedRoute` (which now stays exactly as shipped in Phase 0 — see
  Decisions) rather than modifying it.
- **Firestore data-access layer** (`src/services/firebase/firestore.ts`):
  `submitApplication` writes `/users` and `/profiles` together in one
  atomic `writeBatch` so the denormalized `batchId` on `/users` (used for
  batch-moderator-scoped review queries) can never drift from the
  profile's own; `approveApplication`/`rejectApplication`/
  `requestAnotherReview`/`fetchPendingApplications`/`fetchProfile`.
- **Centralized config, not hard-coded literals**:
  `src/config/batches.ts` generates the batch selector list from a
  single anchor formula (BIM35 = 2018--2020, BIM43 = 2026--2028) rather
  than a literal list — see Decisions re: `EARLIEST_BATCH_NUMBER`.
  `src/config/locations.ts` normalizes city spelling (e.g.
  Bangalore/Bengaluru/BLR → one canonical form) with a small starter
  alias map.
- **Photo handling** (`src/domain/onboarding/photo.ts`): client-side
  canvas center-crop + resize to a 256x256 JPEG, capped well under
  Firestore's document size limit --- see Decisions re: why this isn't
  Firebase Storage.
- **Design system applied**: `src/styles/tokens.css` mirrors
  Design-superconnector.md's colors/spacing/radius/typography (the
  marketing-only sub-systems --- signature full-bleed cards, the pricing
  pill dialect --- are intentionally left out, since this is application
  UI). `src/index.css` and `RootLayout.tsx` are re-themed with it; this
  was blocked in Phase 0 pending the file, which the owner has since
  supplied.
- **Firestore rules** (`firebase/firestore.rules`): see Security section.

### Files

```
src/domain/onboarding/{types.ts, roles.ts, roles.test.ts, validation.ts,
  validation.test.ts, photo.ts, photo.test.ts}
src/config/{batches.ts, batches.test.ts, locations.ts, locations.test.ts}
src/services/firebase/firestore.ts
src/features/onboarding/{useUserRecord.ts, ApplicationForm.tsx,
  ApplicationForm.test.tsx, ApplicationStatus.tsx, OnboardingPage.tsx}
src/features/review/{ReviewQueuePage.tsx, ReviewQueuePage.test.tsx}
src/app/{PortalRoute.tsx, PortalRoute.test.tsx, ReviewerRoute.tsx,
  ReviewerRoute.test.tsx}
src/styles/tokens.css
tests/firestore/rules.test.ts
vitest.rules.config.ts
Modified: src/app/App.tsx, src/pages/{LoginPage,DashboardPage}.tsx,
  src/layouts/RootLayout.tsx, src/index.css, vite.config.ts,
  firebase/{firestore.rules, firestore.indexes.json, firebase.json},
  .github/workflows/{ci.yml, deploy.yml}, package.json, package-lock.json
```

### Firebase / Google / GitHub configuration

- No new Firebase products enabled. Firebase Storage is deliberately
  *not* configured this phase --- see Decisions.
- New composite Firestore index required: `users` collection,
  `role ASC, batchId ASC` (added to `firestore.indexes.json`) --- serves
  a batch moderator's `role == 'pending' && batchId in [...]` query.
- New devDependencies: `@firebase/rules-unit-testing`, `firebase-tools`
  (rules-emulator testing only; no Firebase CLI deploy commands were
  added, so no new deploy credential/secret was introduced).
- New CI/deploy step (both `ci.yml` and `deploy.yml`): `actions/setup-java`
  (Temurin 21) + `firebase emulators:exec ... npm run test:rules`, so
  the Firestore rules tests actually run with a real emulator on every
  push, where this sandbox's network could not.
- **Manual, owner-side steps required** (none of these are automated,
  by design --- see Decisions and `UPLOAD_INSTRUCTIONS.md`):
  1. Publish the new `firebase/firestore.rules` content via the Firebase
     Console's Rules editor (same manual process Phase 0 used for the
     deny-all baseline).
  2. Bootstrap your own admin account by signing in once, then manually
     setting your `/users/{uid}.role` to `superAdmin` (or
     `applicationAdmin`) in the Firestore Console. Batch moderators are
     bootstrapped the same way, additionally setting an `assignedBatches`
     array field. Self-service role/moderator assignment is Phase 11.

### Tests

- `npm run test` (Vitest + Testing Library, jsdom): **48/48 passing**,
  covering role/batch/location/validation/photo-crop pure logic,
  `PortalRoute`/`ReviewerRoute` gating (loading/redirect/render states),
  `ApplicationForm` (required-field validation, unsupported photo type
  rejected without invoking the compressor, full submit flow, Add
  More/Remove for previous organizations), and `ReviewQueuePage`
  (empty state, opening application detail, approve, and reject-with-reason).
- `npm run test:rules` / `npm run test:rules:emulator`
  (`tests/firestore/rules.test.ts`, 20 cases via
  `@firebase/rules-unit-testing`): written and included in this phase's
  files, exercising unauthenticated denial, self-service application
  creation (including rejecting a self-declared non-pending role, an
  oversized photo, and an unexpected extra field), pending-user denial,
  approved self-access, rejected-user resubmission (including that
  `batchId` can't be smuggled through on resubmit), admin approve/reject
  (including that a reviewer can't stamp someone else as `reviewedBy`
  and can't grant an admin/moderator role through the review action),
  and batch-moderator scope (in-batch allowed, cross-batch denied,
  including a scoped `list` query). **Not executed by Claude in this
  environment** --- requires the Firestore emulator; see Acceptance
  criteria above for why and how it gets verified on push.
- `npm run format:check`, `npm run lint` (0 errors), `npm run typecheck`,
  and `npm run build` all pass locally against this phase's code.

### Known issues / deferred work

- **Visual design was only partially applied.** `src/styles/tokens.css`
  and the re-themed `index.css`/`RootLayout.tsx` wired in
  Design-superconnector.md's base tokens (colors, spacing, radius, a
  plain type scale), but stopped short of implementing its actual
  documented components (exact button/card/input treatments, the
  96px section rhythm, etc.), and several of the screens that use
  those tokens (Dashboard, status banners) are still content-sparse
  placeholders. The owner confirmed after deploying that the live app
  doesn't yet visually read as "designed." A full pass closing this gap
  across the whole app (not just new screens) was explicit,
  acceptance-gated scope in Phase 2 — see that phase's record below.
- `npm run lint` reports 3 informational warnings, 0 errors: the
  pre-existing Phase 0 `AuthContext.tsx` fast-refresh warning (unchanged,
  already documented as expected), plus two new `set-state-in-effect`
  warnings on `useUserRecord.ts` and `ReviewQueuePage.tsx`'s
  subscription/query-loading effects. These are the standard, arguably
  unavoidable pattern for "reset loading state when starting a new
  real-time subscription / re-fetching a list on a dependency change";
  a workaround was evaluated and did not meaningfully reduce risk versus
  the current straightforward code, so --- consistent with how the
  project already tolerates the Phase 0 warning --- these are left as
  known/expected rather than force-fit into an awkward rewrite for a
  cosmetic lint signal.
- Firestore rules tests are unverified by execution here (see Acceptance
  criteria) --- first real confirmation happens on the owner's next
  GitHub Actions run.
- No profile-*editing* UI or rule exists yet (`/profiles` is create-only
  in Phase 1's rules) --- intentional; Phase 2 ("Profiles & batch
  management") owns controlled self-editing and adds its own `allow
  update` rule then, per this project's least-privilege pattern of
  granting scope only when a feature needs it.
- Location normalization is a small starter alias map (a handful of
  well-known Indian city aliases), not a full admin-managed geography
  reference --- reasonable for Phase 1's onboarding form; a fuller
  reference table can grow centrally in `src/config/locations.ts` as
  real duplicates are observed.
- `src/config/batches.ts`'s `EARLIEST_BATCH_NUMBER = 1` is an explicit
  placeholder (its formula-derived year, 1984, is almost certainly not
  a real fact about the institution) --- flagged in-code rather than
  invented, per the same spirit as LEGAL.md's placeholder-marking rule.
  The owner should confirm the real earliest batch and update the
  constant.
- Self-service admin/moderator role assignment does not exist yet
  (Phase 11); bootstrapping is a manual Firebase Console step for now
  (documented above and in `UPLOAD_INSTRUCTIONS.md`).
- Live end-to-end click-testing (submitting a real application, having
  a real second Google account review/approve it) has not been done by
  Claude --- no browser-automation tool in this environment, consistent
  with Phase 0's own noted limitation for the Google Sign-In flow. The
  owner should do one real end-to-end pass after publishing the rules.

### Decisions

- **Photo storage: compressed data URL in Firestore, not Firebase
  Storage.** Firebase Storage now requires the paid Blaze plan to
  provision a bucket for a new project. CLAUDE.md's cost guardrail says
  not to attach billing without explicit approval, and
  SETUP_AND_DEPLOYMENT.md / ARCHITECTURE.md both say to confirm the plan
  supports photo storage before implementing it. Rather than either
  silently attaching billing or silently skipping the photo requirement,
  photos are compressed client-side to a small (well under Firestore's
  ~1 MiB document limit) square JPEG and stored directly on the profile
  document --- zero-cost on Spark. If the owner later approves Blaze,
  `src/domain/onboarding/photo.ts` is the module to replace with a real
  Storage upload.
- **`ProtectedRoute.tsx` was not modified.** Its own Phase 0 doc comment
  forecast that Phase 1 would extend it with approval-status checks, but
  doing that in place would have broken its three passing Phase 0 tests
  (which assert a bare signed-in user renders immediately, with no role
  lookup). Instead, `PortalRoute`/`ReviewerRoute` compose it. This keeps
  Phase 0's tested contract completely untouched, at the cost of not
  quite following that file's own forecast comment literally.
- **`/profiles` is create-only in Phase 1's rules**, even though the
  client already has all the profile fields it could plausibly want to
  edit. No Phase 1 feature needs an update path (there's no edit screen
  --- "controlled editing" is explicitly Phase 2's job), so no `allow
  update` rule was added for it, per the project's own stated pattern of
  each phase adding only the scope it actually uses.
- **Rejection resubmission resets status only, not content.** Without a
  profile-edit screen (Phase 2), letting someone "fix and resubmit"
  isn't possible yet; `requestAnotherReview` just flips `rejected` back
  to `pending` so a reviewer takes another look, labeled "Request
  another review" in the UI to be honest about what it actually does.
- **No automated Firestore rules deployment.** Uploading
  `firebase/firestore.rules` to GitHub does not publish it --- that
  still requires the same manual Firebase Console step Phase 0 used for
  the deny-all baseline. Wiring up `firebase deploy --only
  firestore:rules` from CI would need a new Firebase deploy
  credential/secret, which felt like a bigger, separately-approvable
  change than this phase's scope; the emulator-based *testing* added to
  CI needs no such credential.
- **Batch list is formula-generated from a single anchor**, not a
  literal array, per CLAUDE.md's "avoid hard-coded current
  batches/cities/dates" --- see Known issues re: `EARLIEST_BATCH_NUMBER`.
- Design-superconnector.md's tokens are applied only to the subset
  relevant to application UI (colors, spacing, radius, core type scale,
  button/input/card treatments); the marketing-only sub-systems
  (full-bleed signature cards, the pricing pill dialect) are
  intentionally not used, since this is app UI and the design doc's own
  Do's/Don'ts say not to use those outside their marketing context.

### Next phase

Phase 2 --- Profiles & batch management.

## Phase 2 --- Profiles & batch management

**Status: IMPLEMENTED, LOCALLY VERIFIED --- awaiting owner upload,
Firestore rules re-publish, and the visual side-by-side sign-off this
phase's own acceptance criteria call for** (implemented 2026-09-06)

Minimal professional profile: photo, name, location, batch/years,
education, current work, previous work, startup/ownership,
skills/interests. Organization history supports Add More and
current/previous status. Batch data is centralized. Anchor: BIM35 =
2018--2020; current BIM43 = 2026--2028. Future batches must be
data-driven. Acceptance: clean responsive profile, controlled editing,
protected system fields.

**Full visual design pass (whole app, not just the new profile screens).**
Phase 1 only wired up Design-superconnector.md's base tokens into a
mostly-unstyled shell. Phase 2 closes that gap across every screen that
exists by then --- Landing, Login, Onboarding, Dashboard, Review queue,
and the new Profile view/edit. Acceptance for this part specifically:
the owner does a side-by-side visual check against
Design-superconnector.md and confirms it reads as the intended design.

### A note on this document before the record below

While starting this phase, Claude discovered that the copy of this file
actually committed to the repository (`bimsuperconnector/bimsuperconnector.github.io`)
did not contain the Phase 0/Phase 1 completion records above --- it was
still the bare phase-plan text. Those records existed only in Claude's
Project knowledge files, not in the shipped codebase. This upload
restores parity: this file now carries the full Phase 0 + Phase 1
records plus this phase's, so the repository itself (not just Project
knowledge) is the authoritative history going forward, per CLAUDE.md's
development protocol. Please make sure this exact file replaces
`FEATURE_SUPERCONNECTOR.md` in the repo (see the upload instructions
provided alongside this phase's files).

### Acceptance criteria --- status as of 2026-09-06

- **Clean responsive profile** --- IMPLEMENTED. `ProfilePage`/`ProfileView`
  render name, photo, batch, location, education, current + previous
  organizations (with startup markers), skills/interests as chips, and
  networking goals, reusing the same accessible layout patterns
  (semantic `<dl>`, labelled fields, 44px touch targets) as the rest of
  the app. Covered by `ProfilePage.test.tsx` (4/4 passing). **Not
  click-tested in a real browser at real viewport widths** --- no
  browser-automation tool in this environment, the same limitation
  noted in Phase 0/1.
- **Controlled editing** --- VERIFIED locally by test, UNVERIFIED BY
  EXECUTION for the Firestore-rules half. `ProfileEditForm` lets the
  owner edit name, photo, location, education, current/previous
  organizations, skills, interests, and networking goals; `updateProfile`
  writes only those fields. `firebase/firestore.rules` adds a matching
  `allow update` block to `/profiles/{uid}`, scoped to `isSelf(uid)`.
  Component-level behavior is covered by `ProfileEditForm.test.tsx`
  (6/6 passing) and `ProfilePage.test.tsx`'s edit-mode tests. The rules
  themselves are covered by 8 new cases in `tests/firestore/rules.test.ts`
  (28 total, up from 20) --- but exercising them requires the same
  Firestore emulator Phase 1 could not run here (the emulator binary
  download is blocked by this sandbox's network allowlist:
  `storage.googleapis.com` is not on it). I re-confirmed this is still
  the *exact and only* failure by re-running
  `npm run test:rules:emulator` in this session. As with Phase 1, **the
  owner's next push is the real confirmation of this half of the
  criterion** --- CI already runs these via the Phase 1 `firebase
  emulators:exec` step.
- **Protected system fields** --- IMPLEMENTED, same verification status
  as above. The new `allow update` rule requires `uid`, `batchId`, and
  `createdAt` to be byte-identical to what's already stored, rejects any
  key outside the same allow-list `create` uses, and only ever matches
  `isSelf(uid)` --- a reviewer/admin has no update path to profile
  content through this rule at all (only to `/users` role fields, via
  the Phase 1 rule). New test cases assert: batchId change denied, uid
  change denied, createdAt change denied, oversized photo denied,
  unexpected extra field denied, cross-user edit denied, and an
  `applicationAdmin` cannot edit another person's profile through this
  path either.
- **Visual design pass side-by-side check** --- NOT SOMETHING CLAUDE CAN
  VERIFY. This criterion is explicitly the owner's own visual judgment
  against `Design-superconnector.md`, not a testable assertion. See
  Implementation below for what was actually built against the
  documented components/tokens, and do this check once the build is live.

### Implementation

- **Shared form components, extracted rather than duplicated**
  (`src/components/FormField.tsx`, `src/components/OrganizationHistoryFieldset.tsx`):
  Phase 1's `ApplicationForm` had its `Field` wrapper and its
  current/previous-organization fieldset (with Add More/Remove and the
  startup-marker checkbox) written inline. Both are now shared
  components so `ApplicationForm` (create) and the new `ProfileEditForm`
  (edit) render identically instead of drifting apart over time.
  `ApplicationForm.tsx` was refactored to use them; its existing
  `ApplicationForm.test.tsx` (4 tests) passes unchanged, confirming the
  refactor didn't alter behavior.
- **Validation** (`src/domain/onboarding/validation.ts`): added
  `ProfileEditDraft` (= `ApplicationDraft` minus `batchId` --- there is no
  batch selector on the edit form at all, since batch is frozen) and
  `validateProfileEditDraft`. Both the create and edit validators now
  call one shared `validateSharedProfileFields` helper so the two flows
  can't quietly diverge on what counts as a valid profile.
- **Firestore data-access layer** (`src/services/firebase/firestore.ts`):
  added `updateProfile(uid, draft)`, reusing the exact same
  normalization (`buildNormalizedLocation`, `parseTagList`, trimming) as
  `submitApplication` so an edited profile is shaped identically to a
  freshly-submitted one.
- **Firestore rules** (`firebase/firestore.rules`): added the `/profiles/{uid}`
  `allow update` block described in Acceptance criteria above. Review
  decisions still only ever touch `/users/{uid}` --- reviewers/admins get
  no update path to profile content, matching least privilege.
- **Profile feature** (`src/features/profile/`): `useProfile.ts` (one-time
  fetch + manual `reload()` after save --- unlike `useUserRecord`, nothing
  else writes to this document while it's open, so a live subscription
  isn't needed), `ProfileView.tsx` (read-only display), `ProfileEditForm.tsx`
  (reuses the shared Field/OrganizationHistoryFieldset components),
  `ProfilePage.tsx` (view by default, toggles to edit, reloads + shows a
  confirmation on save). Wired at `/profile`, gated by the existing
  `PortalRoute` (approved members only).
- **Dashboard** (`src/pages/DashboardPage.tsx`): now links to `/profile`
  via a `demo-grid-card`-style quick-link list instead of just prose.
- **Full visual design pass** --- implemented the documented components
  from `Design-superconnector.md` rather than just declaring their CSS
  variables:
  - `button-primary`/`button-secondary`: fixed to the documented 16px x 24px
    padding; the base unstyled `<button>` now defaults to the
    button-secondary treatment (the system documents no separate "plain
    button" variant), with `.btn-primary` opting in to the one-per-viewport
    near-black CTA. Extended to `<a>` elements (`a.btn-primary`,
    `a.btn-secondary`) so the Landing/Login CTA links get the same
    treatment as real buttons.
  - `text-input-focus`: inputs/selects/textareas now recolor their
    border to the info-border blue on focus, layered alongside (not
    replacing) the existing `:focus-visible` outline ring so keyboard
    accessibility is unaffected.
  - Chips (skills/interests/batch/startup marker): `{rounded.sm}`, not
    `{rounded.pill}` --- the pill shape is reserved for the pricing
    sub-system per the design doc's own Do's/Don'ts, so chips
    deliberately don't use it.
  - `hero-band` + the documented `{spacing.section}` (96px) rhythm:
    applied to Landing and Login, the two screens where a full
    editorial band actually reads as calm whitespace rather than
    broken empty space on a dense form page (see Decisions).
  - `feature-card-tabbed`-style surface-soft card for the new Profile
    view; `demo-grid-card`-style cards for the Dashboard quick links.
  - `cream-callout-card` (already correctly applied to `.status-card`
    in Phase 1) left as-is --- it already matched the documented
    padding/radius exactly.
  - Added the missing `{spacing.section}` (96px) and `{typography.title-md}`
    (20px/400) tokens to `src/styles/tokens.css`, which Phase 1 hadn't
    pulled in yet.

### Files

```
New:
src/components/{FormField.tsx, OrganizationHistoryFieldset.tsx}
src/features/profile/{useProfile.ts, ProfileView.tsx, ProfileEditForm.tsx,
  ProfileEditForm.test.tsx, ProfilePage.tsx, ProfilePage.test.tsx}

Modified:
firebase/firestore.rules
src/app/App.tsx
src/domain/onboarding/{validation.ts, validation.test.ts}
src/features/onboarding/ApplicationForm.tsx
src/index.css
src/pages/{DashboardPage.tsx, LandingPage.tsx, LoginPage.tsx}
src/services/firebase/firestore.ts
src/styles/tokens.css
tests/firestore/rules.test.ts
```

### Firebase / Google / GitHub configuration

- No new Firebase products enabled; no new Firestore indexes needed
  (profile editing adds no new queries).
- **Manual, owner-side step required** (same pattern as Phase 0/1): the
  updated `firebase/firestore.rules` content must be re-published via
  the Firebase Console's Rules editor before the new `/profiles` update
  rule takes effect in production --- uploading the file to GitHub alone
  does not publish it.
- No new secrets, credentials, or CI steps were needed; the Phase 1
  `firebase emulators:exec` step in `ci.yml`/`deploy.yml` already covers
  the new rules test cases automatically.

### Tests

- `npm run test` (Vitest + Testing Library, jsdom): **61/61 passing**
  (up from 48), adding: `validateProfileEditDraft` coverage (3 new
  cases: accepts a valid draft with no `batchId` key at all, requires
  the same fields as application validation minus batch, doesn't
  require optional fields), `ProfileEditForm.test.tsx` (6 cases:
  pre-fills from the existing profile, shows batch as read-only text
  with no selector, blocks save on a cleared required field, saves
  edited fields and calls `onSaved` with a draft that has no `batchId`
  key, processes a replacement photo through the same compressor as
  onboarding, cancels without saving), `ProfilePage.test.tsx` (4 cases:
  loading state, view mode renders profile including the startup
  marker, edit → save → back to view mode with a confirmation message
  and a `reload()` call, cancel leaves view mode untouched with no save
  call).
- `tests/firestore/rules.test.ts`: **28 cases total (up from 20)** ---
  8 new cases for owned-profile editing: owner can update editable
  content; cannot change `batchId`/`uid`/`createdAt`; oversized photo
  rejected; unexpected extra field rejected; cannot update another
  person's profile; an `applicationAdmin` cannot edit profile content
  through this rule (review decisions only ever touch `/users`). **Not
  executed by Claude in this environment** --- same Firestore-emulator
  network-allowlist limitation as Phase 1; re-confirmed this session
  that the failure is still exactly `download failed, status 403: Host
  not in allowlist: storage.googleapis.com`, nothing else. Runs for real
  in CI on the next push.
- `npm run format:check`, `npm run lint` (0 errors, 4 informational
  warnings --- the 3 pre-existing Phase 0/1 warnings plus one new
  `set-state-in-effect` warning on `useProfile.ts`, the same
  already-tolerated pattern as `useUserRecord.ts` --- see Phase 1's
  Known issues for why this is left as-is), `npm run typecheck`, and
  `npm run build` all pass locally against this phase's code.

### Known issues / deferred work

- **The visual design pass's own acceptance criterion cannot be
  verified by Claude** --- it explicitly asks the owner to do a
  side-by-side check against `Design-superconnector.md` after deploying.
  Everything Claude could verify (component treatments match the
  documented padding/radius/color values in code) is done; the
  subjective "does this read as designed" call is the owner's.
- **`{spacing.section}` (96px) is applied to Landing/Login only, not to
  every screen.** The design doc calls it "the universal vertical
  rhythm constant" for editorial bands; applying it literally to
  Onboarding's multi-fieldset form or the Profile edit form would have
  meant 96px of dead space above/below a dense form, which reads as
  broken, not calm. Those screens instead get generous card/fieldset
  padding at `{spacing.lg}`/`{spacing.xl}`. Flagging this as an explicit
  interpretive choice rather than a silent gap, in case the owner's
  side-by-side check disagrees with it.
- **`/users.displayName` doesn't sync when a profile's name is edited.**
  It's used only in the review queue's pending-applicant list (a
  snapshot from application time); nothing in Phase 2 reads it after
  approval, so this was left alone rather than widening the Phase 1
  `/users` update rule for a field nothing currently displays post-approval.
  Revisit if a future phase needs the post-approval display name to
  stay current.
- Firestore rules tests are unverified by execution here (see Acceptance
  criteria above) --- same as Phase 1, first real confirmation happens
  on the owner's next GitHub Actions run.
- Live click-testing at real viewport widths (mobile/tablet/desktop) has
  not been done by Claude --- no browser-automation tool in this
  environment, consistent with Phase 0/1's own noted limitation.
- This document itself was out of sync with the live repository before
  this phase (see the note above, before Acceptance criteria) --- worth
  the owner double-checking after upload that this file is the one that
  actually lands in the repo, since it's now the single source of truth
  for the phase history going forward.

### Decisions

- **`batchId` stays frozen on profile edits, with no path to change it
  from this screen.** CLAUDE.md's "never allow ... editing of protected
  workflow state" and the existing Phase 1 pattern (where `/users.batchId`
  is already frozen after creation) both point the same way: batch
  reassignment isn't a Phase 2 feature, so the edit form doesn't expose
  a batch selector at all, and the rules independently reject any
  attempt to change it via a crafted request.
- **Reviewers/admins get no update path to `/profiles` content, even
  though `canReview()` already exists and could have been reused.**
  Review decisions changing profile content (as opposed to role) wasn't
  asked for anywhere in this phase's spec, and granting it would be
  scope creep against least privilege --- new test explicitly asserts an
  `applicationAdmin` cannot use this rule to edit someone else's profile.
- **Shared `Field`/`OrganizationHistoryFieldset` extraction touched
  Phase 1's `ApplicationForm.tsx`.** This is the one place Phase 2 edits
  a previous phase's file rather than only adding new ones. It was worth
  doing to avoid ~150 lines of duplicated organization-history markup
  drifting apart from the new edit form; `ApplicationForm.test.tsx`'s
  4 existing tests pass unchanged, confirming no behavior change.
- **`useProfile` uses a one-time fetch + manual `reload()`, not a live
  `onSnapshot` subscription** (unlike `useUserRecord`). Nothing else
  writes to a person's own profile while they're looking at it, so a
  live subscription would add complexity (and another `set-state-in-effect`
  surface) without a behavioral benefit.
- **This file (`FEATURE_SUPERCONNECTOR.md`) was rewritten to restore the
  Phase 0/1 completion records that existed in Project knowledge but not
  in the actual repository** --- see the note above, before Acceptance
  criteria, for why.

### Next phase

Phase 3 --- Directory & search.

## Phase 3 --- Directory & search

Search by name, organization, educational institution, location, batch,
role, industry, skills, entrepreneurship and Open to Work. Use
controlled indexed queries; do not download all profiles to the browser.
Acceptance: useful combined search/filter experience without exposing
protected fields.

## Phase 4 --- Connector registration

Monthly registration; Saturday/Sunday/Both; One-to-One or Small Circle;
topics; networking intent. Default meeting window Saturday/Sunday 5--6
PM, third weekend, timezone Asia/Kolkata; all configurable. Small Circle
target 6, min 3, max 6. Acceptance: cycle state and registration
deadlines are enforced.

## Phase 5 --- Matching engine

Hidden Connection Meter starts at 1000. Initial one-to-one weights:
shared topics 40%, professional interests 20%, networking purpose 15%,
complementary skills 10%, ELO proximity 10%, other 5%. Strong
repeat-match and negative-pair penalties. Groups optimize compatibility
plus useful diversity. Pure/testable modules: elo, compatibility,
history, pairing, grouping, topicAnalysis, orchestration. Acceptance:
deterministic tests for edge cases, repeats, insufficient pools and
group sizing.

## Phase 6 --- Feedback & Connection Meter

After each session: **How was your connection with \[Name\]?** Choices:
Great connection / Okay / Not a good connection, plus optional
skip/neutral. Suggested small movement around ±3--5, configurable.
Maintain person score and pair-specific history. Never label a person
based on one negative rating. Acceptance: client cannot directly modify
scores; feedback is validated and trusted score updates are controlled.

## Phase 7 --- Monthly automation

Registration open → close → match → save → Calendar/Meet → notifications
→ meeting → feedback → score update → next cycle. Idempotent/retry-safe.
No duplicate matches/events/invitations. Acceptance: rerun/dry-run tests
prove safe retries.

## Phase 8 --- Calendar & Meet

Central monthly SuperConnector meetings use dedicated SuperConnector
Google account as organizer. Alumni-created virtual events use event
creator OAuth and their calendar; creator is organizer. Never collect
passwords. Persist event IDs and sync status. Acceptance: OAuth setup
documented; event/Meet creation and attendee invitations tested.

## Phase 9 --- Jobs

Mandatory: hiring company, title, location, employment type, urgency/how
soon role should be filled, JD, skills/experience, contact person,
contact details, application method, expiration date. Admin moderation.
Expired jobs automatically leave active visibility and remain archived.
Acceptance: active queries cannot return expired jobs.

## Phase 10 --- Open to Work

Opt-in status and filters by industry, function, experience, location,
skills, degree, batch, availability. Never expose ELO.

## Phase 11 --- Admin, moderators & analytics

Super/platform/application admins; batch moderators scoped to assigned
batches. Manage onboarding, batches, moderators, jobs/events, connector
settings, audit history and aggregate analytics. Metrics include alumni,
approvals, participation, connections, feedback, topics, jobs, Open to
Work, ventures and events. Acceptance: least privilege works in
Firestore rules and UI.

## Phase 12 --- Entrepreneurship & organization history

Organization history is source of truth. Marking an organization as
startup/entrepreneurial automatically contributes to Entrepreneurship
dashboard. Search/filter by company, industry, city, batch,
founder/member, status. No duplicate entrepreneur profile.

## Phase 13 --- Events & meetups

Approved alumni can create virtual/physical/other events. Fields: title,
description, date/time/timezone, type, Meet link if applicable,
venue/address, RSVP deadline, organizer, capacity, target audience,
status. Target everyone, batch(es), city/location or selected
individuals. Enforce RSVP deadline/capacity. Do not expose unrelated
private profiles.

## Phase 14 --- Autonomous communication & segmentation

Firestore derives desired membership from approval, batch, region,
country/city and communication preferences. Example: approved + BIM35 +
India + Chennai → all-alumni + BIM35 + India + Chennai. Normalize
locations. Google Groups is the communication layer only if the selected
Google account/domain has the required administrative capabilities. If
Workspace/admin capabilities are required, stop and ask before adding a
paid dependency.

## Phase 15 --- Landing, legal, PWA polish & launch

Public landing with safe aggregate metrics and Login. No private data.
Publish Terms and Privacy pages. Final
responsive/accessibility/security/performance pass. Test PWA
installation, authentication, rules, core workflows and GitHub Pages
production deployment.

## Deferred without explicit approval

Paid email provider, paid backend, Cloud Functions/Cloud Run requiring
billing, arbitrary bulk Gmail sending, public profiles/events,
advertising, commissions.
