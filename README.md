# SuperConnector

Private, free, professional BIM alumni network and networking platform.
Static PWA (React + TypeScript + Vite) on GitHub Pages, Firebase
Authentication (Google Sign-In), Cloud Firestore. See `CLAUDE.md`,
`ARCHITECTURE.md`, `Design-superconnector.md`, `SECURITY_AND_TESTING.md`,
`LEGAL.md` and `FEATURE_SUPERCONNECTOR.md` for the full project spec —
those documents govern all future work in this repo.

## Status

Phase 0 (Foundation & setup) — see `FEATURE_SUPERCONNECTOR.md`.

## This repo is maintained via the GitHub website, not local git

Nothing here requires the `git` or `firebase` command-line tools or a
local `npm install`. Files are uploaded through GitHub's web UI, the
Firestore rules are pasted directly into the Firebase Console, and
every build/deploy happens automatically in GitHub Actions after you
upload. See the full walkthrough Claude gave you in chat for exact
click-by-click steps. Short version:

1. Upload every file in this package to the `bimsuperconnector.github.io`
   repo via **Add file → Upload files**, preserving folder structure.
2. Confirm `.github/workflows/deploy.yml` exists in the repo (GitHub's
   uploader sometimes drops dotfolders — if it's missing, create it by
   hand with **Add file → Create new file**, typing the full path).
3. Add your icon files at `public/icons/logo-192.png`,
   `public/icons/logo-512.png`, and `public/favicon.ico`. Then delete
   `public/icons/README.md`.
4. In the Firebase Console: enable Google sign-in, add
   `bimsuperconnector.github.io` as an authorized domain, create
   Firestore, and paste the contents of `firebase/firestore.rules` into
   the Rules tab, then Publish.
5. In the GitHub repo: **Settings → Pages → Source → GitHub Actions**,
   and **Settings → Secrets and variables → Actions → Variables tab** →
   add the 7 `VITE_FIREBASE_*` values.
6. Any commit to `main` (including a web upload) triggers the
   `deploy.yml` workflow automatically — watch it in the **Actions**
   tab.

`.env.example`, `.gitignore`, and `.firebaserc` are optional — they only
matter if someone later works on this repo from a local machine with
git/npm/firebase-tools installed. Skip them if they're awkward to
upload from the browser.

### After first deploy — smoke test

- Visit the production URL, confirm the landing page renders.
- Click "Sign up for free" → Google popup → sign in.
- Confirm you land on `/pending` (every new sign-in starts as role
  `pending` until Phase 1's review workflow exists).
- In Firebase Console → Firestore, confirm a `users/{uid}` document was
  created with `role: "pending"`.
- Reload while signed in on a deep link like `/dashboard` directly (not
  by clicking through the app) to confirm the GitHub Pages 404→redirect
  trick (`public/404.html`) correctly restores the route instead of
  showing a real 404.
- Install as a PWA on a phone/desktop to confirm the manifest + service
  worker work (once your icon files are in place per step 1).

## Local scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run build` | Production build to `dist/` |
| `npm run format` | Prettier write |

## What Phase 0 does and does not include

**Included:** project scaffolding, TypeScript, lint/format/test tooling,
Firebase Authentication (Google Sign-In) wiring, a restrictive Firestore
rules baseline, the auth-state → role → protected-route architecture,
PWA manifest/service worker scaffolding, GitHub Actions CI/CD to GitHub
Pages, and stub `/terms` and `/privacy` legal routes.

**Not included (later phases):** the real onboarding/profile form,
batch-moderator review queue, directory/search, matching engine,
jobs/events/Open to Work, admin console, Google Calendar/Meet
integration, Google Groups segmentation, and final legal copy. The
`/pending` and `/dashboard` pages you'll see right now are intentionally
minimal placeholders that exist only to prove the routing/auth
architecture end to end.
