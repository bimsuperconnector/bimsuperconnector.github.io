# SuperConnector

A private, free, professional BIM alumni network and networking platform,
delivered as an installable PWA (phone, tablet, desktop).

**Current status: Phase 0 — Foundation & setup.** See
`FEATURE_SUPERCONNECTOR.md` for the full phase plan. This README is the
step-by-step guide from a blank Google/GitHub account through first
deployment. Follow it in order — later steps depend on earlier ones.

> `Design-superconnector.md` (the visual design system) has not been
> supplied yet, so the UI in this phase is intentionally plain/unstyled
> beyond basic accessibility. Once that file exists, a design pass applies
> its colors/typography/components — nothing here should be mistaken for
> final visual design.

## 1. Accounts

1. Create a **dedicated Google account** for this project (not a personal
   account) and turn on 2-Step Verification.
2. Create a **dedicated GitHub account** (or a dedicated org) for this
   project and turn on 2FA.
3. Keep credentials for both in a password manager; you'll need them for
   the steps below.

## 2. Firebase project

Follow along with the official docs, since exact console screens change
over time:

- Web setup: https://firebase.google.com/docs/web/setup
- Google Sign-In: https://firebase.google.com/docs/auth/web/google-signin
- Firestore quickstart: https://firebase.google.com/docs/firestore/quickstart

Steps:

1. Go to the Firebase console and create a new project on the dedicated
   Google account. Keep it on the **Spark (no-cost)** plan for now — do
   not attach billing.
2. Register a **Web app** inside the project. Firebase will show you a
   config object (`apiKey`, `authDomain`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`) — copy these into your local `.env` (see
   step 6) and, later, into GitHub repository secrets (see step 7).
3. Enable **Authentication** → sign-in method → **Google** provider.
4. Under Authentication → Settings → **Authorized domains**, add:
   - `localhost` (should already be there, for local dev)
   - your GitHub Pages domain once you know it (step 5), e.g.
     `your-username.github.io`
5. Create a **Firestore database** (Native mode). When prompted for
   rules, start in **production/locked mode** — this repo's
   `firebase/firestore.rules` already denies all reads/writes by default,
   matching that.
6. Don't configure Storage yet — confirm your Spark-plan limits are
   acceptable for photo storage before wiring that up (a later phase).

## 3. Google Calendar/Meet (needed starting Phase 8 — skip for now)

Not required for Phase 0. When you get there: create/select a Google
Cloud project, enable the Calendar API, configure the OAuth consent
screen, and set authorized origins/redirects to match your real deployed
URL. See
https://developers.google.com/workspace/calendar/api/guides/create-events.
Never collect Google passwords directly — this goes through OAuth only.

## 4. Google Groups (needed starting Phase 14 — skip for now)

Before any code assumes Google Groups admin capabilities, confirm your
Google account/domain actually has Workspace Directory group-management
rights. A plain consumer Gmail account does not. If a paid Workspace plan
would be required, stop and get explicit approval first.

## 5. GitHub repository & Pages

1. Create a new repository under the dedicated GitHub account (private is
   fine — GitHub Pages can still serve a private repo's site, which is
   expected here since the _app_ enforces access, not the repo's
   visibility).
2. Push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Phase 0: foundation & setup"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages** and set the source to
   **GitHub Actions** (not "Deploy from a branch"). The workflow at
   `.github/workflows/deploy.yml` handles the rest.
4. Note your Pages URL: `https://<you>.github.io/<repo>/` (unless you
   configure a custom domain). Add that hostname back into Firebase's
   Authorized domains (step 2.4).

## 6. Local environment variables

```bash
cp .env.example .env
```

Fill in the six `VITE_FIREBASE_*` values from step 2.2. Leave
`VITE_BASE_PATH=/` for local dev. `.env` is git-ignored — never commit it.

## 7. GitHub Actions secrets & variables

In the repo: **Settings → Secrets and variables → Actions**.

Add these **repository secrets** (Secrets tab) — same six values as your
`.env`, used by the deploy workflow to build with your real Firebase
config:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optionally add a **repository variable** (Variables tab) if you're using
a custom domain served from the root:

- `VITE_BASE_PATH` = `/`

(If you don't set it, the deploy workflow defaults to `/<repo-name>/`,
which is correct for the default `github.io/<repo>` URL.)

These are the standard _public_ Firebase Web config values, not private
credentials — but they still live in secrets so the real project/app IDs
aren't hard-coded into a workflow file that anyone with repo read access
can see in plain text.

## 8. Firestore rules deployment

Install the Firebase CLI locally (not committed to this repo) and deploy
the restrictive baseline rules:

```bash
npm install -g firebase-tools
firebase login   # on the dedicated Google account
cd firebase
cp .firebaserc.example .firebaserc   # then edit in your real project id
firebase deploy --only firestore:rules,firestore:indexes
```

## 9. Local development

```bash
npm install
npm run dev
```

Visit the printed localhost URL. You should be able to load the landing
page, click through to `/login`, sign in with Google, and land on
`/dashboard`. Signing out returns you to `/login`; visiting `/dashboard`
while signed out redirects you to `/login`.

## 10. Verification (run before every push)

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview   # local production smoke test
```

All of these also run in `.github/workflows/ci.yml` on every push/PR, and
again (plus the real build) in `.github/workflows/deploy.yml` before
publishing to GitHub Pages.

## 11. After first deployment — smoke test

Once `deploy.yml` finishes, visit your Pages URL and check:

- Landing page loads
- Login → Google Sign-In works end-to-end
- Dashboard is reachable only when signed in; direct navigation while
  signed out redirects to `/login`
- `/terms` and `/privacy` load (placeholder content for now)
- The PWA installs (browser install prompt / "Add to Home Screen")
- Firestore read/write is denied for everything (expected — Phase 0's
  rules are deny-all; nothing should read/write yet)

## Project structure

See `ARCHITECTURE.md` for the full rationale. Source layout:

```
src/
  app/            routing shell, protected-route guard
  pages/          top-level route components
  layouts/        shared page chrome (nav, footer, legal links)
  features/       one folder per product module (auth done; rest are
                   empty scaffolds for later phases)
  services/       firebase, calendar, groups clients
  domain/matching/ pure/testable matching-engine modules (Phase 5)
  tests/          test setup
firebase/         firestore.rules, firestore.indexes.json, firebase.json
.github/workflows/ ci.yml (verify), deploy.yml (GitHub Pages)
```

## Known issues / deferred work (Phase 0)

- Main JS bundle is ~700 KB (mostly the Firebase SDK). Not code-split yet;
  acceptable for Phase 0, worth revisiting once more features land.
- No visual design applied — waiting on `Design-superconnector.md`.
- Google Calendar/Meet, Google Groups, and Firebase Storage are
  intentionally not configured yet (later phases; see sections 3–4 above).
- `oxlint` reports one informational warning (fast-refresh export rule on
  `AuthContext.tsx`'s `useAuth` hook) — expected for the
  context-plus-hook-in-one-file pattern; not an error, does not block CI.
