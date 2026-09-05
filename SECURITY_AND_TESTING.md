# SuperConnector --- Security & QA

## Rules

Zero-trust browser; authenticate and authorize every protected action;
validate all inputs; minimize personal data; never expose ELO; never
allow role escalation; do not trust client-provided protected
timestamps/statuses; keep secrets out of frontend bundles.

## Firestore tests

Test unauthenticated denial; pending-user denial; approved access;
owned-profile editing; protected-field denial; batch-moderator scope;
admin permissions; audit protection; private event scope; job
moderation; expired-job visibility.

## Profile/photo tests

Oversized/unsupported/broken images; compression; required fields;
organization Add More; startup marker; normalized location; safe URLs.

## Search tests

Name, organization, educational institution, location, batch and
combined filters; pagination; no unauthorized fields; no full-database
client download.

## Matching tests

0/1/2/odd participants; insufficient groups; exact six; multiple groups;
repeats; negative pair history; complementary skills; ELO proximity;
deterministic tie-breaking; rerun idempotency.

## Feedback/ELO

New score 1000; positive/negative small configured movement; neutral
zero; pair history updated; one negative does not label a person; client
cannot set score.

## Jobs

Mandatory fields; valid expiration; expiry archive; active query
excludes expired; poster permissions; moderation.

## Events

Targeting; RSVP deadline; capacity; cancellation; private visibility;
organizer cannot access unrelated profiles; Calendar/Meet failure
recovery.

## Automation

Run every scheduled job twice in tests. No duplicate matches, events,
invitations, group membership changes or archives.

## Accessibility/performance

Keyboard navigation, visible focus, semantic headings, contrast, reduced
motion, touch targets, lazy loading, compressed images, pagination and
sensible bundle size. Do not indiscriminately cache private Firestore
responses in a service worker.

## Release gate

No production release if security rules are broad/public, tests/build
fail, secrets are committed, private data is exposed, protected fields
are client writable, or duplicate automation side effects remain
possible.
