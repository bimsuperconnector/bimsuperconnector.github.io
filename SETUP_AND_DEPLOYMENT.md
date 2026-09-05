# SuperConnector --- Setup From Zero to Deployment

## 1. Accounts

Create dedicated Google and GitHub accounts for the project, enable
strong account security/2FA, and create the Firebase project under the
chosen Google account.

## 2. Firebase setup

Claude must guide the owner step-by-step through: create project →
register Web App → record web config → enable Authentication → enable
Google provider → add development/production authorized domains → create
Firestore → begin with restrictive rules → add indexes as required →
configure App Check where appropriate → configure photo storage only
after confirming the selected plan supports it.

Official docs to verify during setup: - Firebase Web setup:
https://firebase.google.com/docs/web/setup - Google Sign-In:
https://firebase.google.com/docs/auth/web/google-signin - Firestore
security: https://firebase.google.com/docs/firestore/quickstart

## 3. Google Calendar/Meet

Create/select the Google Cloud project, enable Calendar API, configure
OAuth consent, set authorized origins/redirects based on the actual
deployment, request minimum required scopes, and test with the dedicated
account. Alumni-created events require each creator's own OAuth consent.
Never collect Google passwords. Official:
https://developers.google.com/workspace/calendar/api/guides/create-events

## 4. Google Groups

Before coding automatic creation/membership, verify whether the chosen
account/domain has the required Google Workspace administrative
capabilities. A consumer Gmail account must not be assumed to have
Workspace Directory group-management rights. If a paid Workspace
dependency is required, stop and obtain explicit approval.

## 5. GitHub Pages

Create repository → push project → configure GitHub Pages via Actions →
deploy static build → configure custom domain if desired → verify HTTPS
→ ensure Firebase authorized domains match production. GitHub Pages
supports custom domains and Actions deployment; verify current official
documentation during setup. Official: https://docs.github.com/en/pages

## 6. Environment variables

Create `.env.example`; keep local `.env` ignored. Typical public
Firebase web config variables may use `VITE_` prefix. Never put private
OAuth secrets, service-account keys, GitHub tokens or refresh tokens
into frontend code. Trusted automation secrets belong in GitHub secret
storage or an appropriate secure environment.

## 7. Deployment gate

Before push: typecheck → lint → unit tests → production build → local
production smoke test. After deployment: login, approval flow, Firestore
access, PWA install, legal pages, protected routes,
mobile/tablet/desktop smoke tests.

## 8. Cost guardrail

Initial target is zero-cost. Firebase Spark currently provides no-cost
quotas for supported services, but some Google Cloud features are
unavailable on Spark. Do not attach billing or introduce a service that
can create charges without explicit approval.
