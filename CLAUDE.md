# SuperConnector --- Permanent Project Instructions

## Product

SuperConnector is a private, free, professional BIM alumni network and
networking platform delivered as an installable PWA for phone, tablet
and desktop.

Core modules: authentication/onboarding, profiles/directory,
professional history, entrepreneurship, monthly networking, hidden
Connection Meter, jobs, Open to Work, events, autonomous communication
segmentation, moderation/admin, analytics, Google Calendar/Meet, legal
pages and PWA.

## Non-negotiable architecture

-   TypeScript/JavaScript PWA; static frontend on GitHub Pages.
-   Firebase Authentication with Google Sign-In.
-   Cloud Firestore as system of record.
-   Security enforced by Firebase Authentication + Firestore Security
    Rules, never UI-only.
-   Keep the initial architecture compatible with Firebase Spark/no-cost
    usage. Do not introduce paid email providers, Cloud Functions, Cloud
    Run, or other paid backend without explicit owner approval.
-   GitHub Actions may run trusted scheduled automation where
    appropriate; secrets never reach the browser.
-   Google Calendar/Meet for calendar/meeting integration.
-   Google Groups, where technically/admin supported, is a communication
    layer; Firestore remains the source of truth for desired membership.
-   No ads, no commissions.
-   One identity/profile across every module.
-   Never expose hidden ELO/Connection Meter or allow clients to edit
    it.
-   Never allow client role escalation or editing of protected workflow
    state.

## Design

`Design-superconnector.md` is supplied by the owner and is
authoritative. Read it before UI work. Do not create, overwrite or
replace it. Follow its colors, typography, spacing, radius, components
and editorial language. The app must be modern, fluid, stylish, clean
and minimal. Responsive first for mobile/tablet/desktop. Use subtle
motion only when useful. Support keyboard navigation, focus states,
contrast, semantic HTML and reduced motion.

## Roles

At minimum: `superAdmin`, `platformAdmin`, `applicationAdmin`,
`batchModerator`, `member`, `pending`, `rejected`. Batch moderators are
scoped to assigned batch(es). Higher roles can perform lower-role
functions.

## Profile requirements

Onboarding collects a photo; compress/resize it before storage. Profile
includes name, photo, current location, BIM batch + years, education,
current organization/role, previous organizations/roles/duration,
startup/ownership markers, and relevant professional/networking fields.

## Development protocol

Before any work: inspect the same physical project folder; read
`CLAUDE.md`, relevant `FEATURE_SUPERCONNECTOR.md`, and
`Design-superconnector.md`; inspect existing code; do not redo completed
phases; keep changes scoped; centralize configuration; avoid hard-coded
current batches/cities/dates.

Every phase records objective, prerequisites, implementation, files,
Firebase/Google/GitHub configuration, security, tests, acceptance
criteria, known issues and deferred work.

When the owner says **Mark Phase X as complete**, verify acceptance
criteria, record
implementation/files/config/tests/issues/decisions/deferred work, mark
COMPLETE in `FEATURE_SUPERCONNECTOR.md`, save it, and identify the next
phase. Do not merely say it is complete in chat.

Fresh-session prompt: "I want to continue implementing
FEATURE_SUPERCONNECTOR.md. Read the project, CLAUDE.md,
Design-superconnector.md and the feature document and tell me exactly
where the project currently stands." Then "Implement Phase X only."

## Quality

Run typecheck, lint, unit tests and production build before claiming
completion. Do not claim bug-free; state what was actually verified. For
current external setup details, consult official Firebase/Google/GitHub
documentation.
