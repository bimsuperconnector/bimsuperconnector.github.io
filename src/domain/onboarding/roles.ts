/**
 * The account role model, per CLAUDE.md:
 *   superAdmin, platformAdmin, applicationAdmin, batchModerator, member,
 *   pending, rejected.
 *
 * `pending` and `rejected` double as *application status* — there is
 * deliberately no separate status field. This is the single protected
 * authorization field for an account; it must never be client-writable
 * except for the two narrow, non-escalating transitions implemented in
 * Phase 1 (self: rejected -> pending; reviewer: pending -> member /
 * pending -> rejected). Firestore Security Rules
 * (`firebase/firestore.rules`) are the actual enforcement point — this
 * module exists so the client's own UX logic and tests share one
 * definition instead of scattering role strings across files.
 *
 * `erasableSyntaxOnly` is enabled in tsconfig, so this uses a string
 * union + const arrays rather than a TypeScript `enum`.
 */
export type Role =
  | 'pending'
  | 'rejected'
  | 'member'
  | 'batchModerator'
  | 'applicationAdmin'
  | 'platformAdmin'
  | 'superAdmin';

export const ALL_ROLES: readonly Role[] = [
  'pending',
  'rejected',
  'member',
  'batchModerator',
  'applicationAdmin',
  'platformAdmin',
  'superAdmin',
];

/** Roles that grant blanket review authority, independent of batch. */
export const ADMIN_ROLES: readonly Role[] = [
  'applicationAdmin',
  'platformAdmin',
  'superAdmin',
];

/** Roles that may review pending applications (admins + scoped batch moderators). */
export const REVIEWER_ROLES: readonly Role[] = [
  'batchModerator',
  ...ADMIN_ROLES,
];

/** Roles that grant access to the member portal. */
export const APPROVED_ROLES: readonly Role[] = ['member', ...REVIEWER_ROLES];

export function isAdminRole(role: Role | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as string[]).includes(role);
}

export function isReviewerRole(role: Role | null | undefined): boolean {
  return !!role && (REVIEWER_ROLES as string[]).includes(role);
}

export function isApprovedRole(role: Role | null | undefined): boolean {
  return !!role && (APPROVED_ROLES as string[]).includes(role);
}

/**
 * Whether `reviewerRole`, optionally scoped to `reviewerBatches`, may
 * review an application in `targetBatchId`. Mirrors the `canReview()`
 * helper in `firebase/firestore.rules` — kept in sync by hand since the
 * two run in different languages/environments.
 */
export function canReviewBatch(
  reviewerRole: Role | null | undefined,
  reviewerBatches: readonly string[] | undefined,
  targetBatchId: string,
): boolean {
  if (isAdminRole(reviewerRole)) return true;
  if (reviewerRole !== 'batchModerator') return false;
  return !!reviewerBatches?.includes(targetBatchId);
}

export const ROLE_LABELS: Record<Role, string> = {
  pending: 'Pending review',
  rejected: 'Not approved',
  member: 'Member',
  batchModerator: 'Batch moderator',
  applicationAdmin: 'Application admin',
  platformAdmin: 'Platform admin',
  superAdmin: 'Super admin',
};
