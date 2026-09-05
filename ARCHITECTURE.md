# SuperConnector --- Complete Architecture

## Stack

GitHub Pages → PWA frontend → Firebase Authentication → Firestore.
External: Google Calendar API/Google Meet, Google Groups where
supported, GitHub Actions for trusted scheduled automation.

## Suggested structure

`src/app`, `components`, `pages`, `layouts`,
`features/{auth,onboarding,profiles,directory,connector,jobs,openToWork,entrepreneurship,events,admin,notifications,legal}`,
`services/{firebase,calendar,groups}`,
`domain/matching/{elo,compatibility,history,pairing,grouping,topicAnalysis,orchestration}`,
`tests`,
`firebase/{firestore.rules,firestore.indexes.json,firebase.json}`,
`.github/workflows`.

## Firestore domains

users, profiles, batches, organizations, ventures, topics,
connector_cycles, connector_participants, matches, connection_history,
connection_scores, feedback, jobs, open_to_work, events, event_rsvps,
notifications, communication_segments, group_sync_jobs, admin_actions,
app_config. Introduce only what each phase needs.

## Security

Authentication proves identity; Firestore rules authorize every
read/write. Protected fields include role, approval status, ELO, match
assignments, audit logs and system state. Batch moderator permissions
are scoped by assigned batch. Use least privilege.

## Photo

Client validates type/size, resizes/crops and compresses, then uploads
only an appropriate derivative. Avoid retaining originals unless needed.
Do not use unrestricted public storage. Confirm selected Firebase
billing/storage capabilities before implementation.

## Search

Use indexed, controlled Firestore queries and pagination. Never send the
entire alumni database to the browser. If advanced search needs a
derived index, keep it privacy-aware and do not add an external search
service without approval.

## Communication

Firestore is authoritative. Desired group membership derives from
profile attributes. Google Groups is a delivery layer. A reconciliation
process compares desired vs actual membership and repairs differences.
It must be idempotent/retry-safe.

## Geography

Normalize country/region/city. Avoid free-text duplicates such as
Bangalore/Bengaluru/BLR. Maintain controlled reference data and admin
management. Create communication groups only where configured/useful.

## Calendar/Meet

Monthly connector: dedicated organizer account → Calendar event → Meet
conference → attendees. Alumni-created event: creator OAuth → creator
calendar → event → Meet if virtual → attendees. Persist provider event
ID, organizer, cycle/event ID and sync state.

## Notifications

Reusable notification object: recipient, type, entity reference,
createdAt, readAt, delivery state. Initial zero-cost approach: in-app
notifications + Google Calendar invitation/reminder emails + Google
Groups broadcasts where supported. Do not assume Firebase Spark is a
general transactional email service.

## Automation

Every scheduled operation needs unique job/cycle key, idempotency key,
retry state, audit trail and duplicate-side-effect protection.

## UI

Public: Landing → Login → Terms/Privacy. Authenticated: Dashboard,
Profile, Directory, SuperConnector, Jobs, Open to Work,
Entrepreneurship, Events, Notifications, Settings. Admin: Dashboard,
Applications, Moderators, Batches, Jobs, Events, Connector, Analytics,
Audit. Route guards are UX only; rules are security.

## Data principles

No duplicate accounts. No public email exposure by default. No
client-controlled ELO/roles. No arbitrary client access to unrelated
event/profile data.
