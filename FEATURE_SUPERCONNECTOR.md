# SuperConnector --- Phase-by-Phase Implementation Plan

## Product objective

A private alumni ecosystem where verified BIM alumni maintain a
professional identity, discover each other, network monthly, find jobs,
advertise ventures, attend events and communicate through controlled
alumni segments.

## Phase 0 --- Foundation & setup

Create maintainable PWA structure, TypeScript, lint/format/test tooling,
Firebase project, Google Sign-In, Firestore, restrictive security
baseline, GitHub repository/Pages deployment, PWA manifest/service
worker, legal routes. Claude must guide the owner step-by-step from
account creation through first deployment. Acceptance: local app works,
Firebase connects, auth/protected-route architecture exists, GitHub
Pages deployment works.

## Phase 1 --- Authentication & onboarding

Google Sign-In → profile/application → pending → batch
moderator/application admin review → approved/rejected → portal. Collect
name, photo, BIM batch/years, location, education, current/previous
employment and roles, startup/ownership marker, skills/interests and
networking fields. Compress/resize photo before storage. Acceptance:
unauthorized/pending users cannot access private portal; approval is
enforced by rules.

## Phase 2 --- Profiles & batch management

Minimal professional profile: photo, name, location, batch/years,
education, current work, previous work, startup/ownership,
skills/interests. Organization history supports Add More and
current/previous status. Batch data is centralized. Anchor: BIM35 =
2018--2020; current BIM43 = 2026--2028. Future batches must be
data-driven. Acceptance: clean responsive profile, controlled editing,
protected system fields.

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
