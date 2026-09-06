import { describe, expect, it } from 'vitest';
import {
  canReviewBatch,
  isAdminRole,
  isApprovedRole,
  isReviewerRole,
} from './roles';

describe('role helpers', () => {
  it('classifies admin roles', () => {
    expect(isAdminRole('applicationAdmin')).toBe(true);
    expect(isAdminRole('platformAdmin')).toBe(true);
    expect(isAdminRole('superAdmin')).toBe(true);
    expect(isAdminRole('batchModerator')).toBe(false);
    expect(isAdminRole('member')).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });

  it('classifies reviewer roles (admins + batch moderator)', () => {
    expect(isReviewerRole('batchModerator')).toBe(true);
    expect(isReviewerRole('applicationAdmin')).toBe(true);
    expect(isReviewerRole('member')).toBe(false);
    expect(isReviewerRole('pending')).toBe(false);
  });

  it('classifies approved (portal-access) roles', () => {
    expect(isApprovedRole('member')).toBe(true);
    expect(isApprovedRole('batchModerator')).toBe(true);
    expect(isApprovedRole('pending')).toBe(false);
    expect(isApprovedRole('rejected')).toBe(false);
  });
});

describe('canReviewBatch', () => {
  it('lets any admin role review any batch', () => {
    expect(canReviewBatch('applicationAdmin', undefined, 'BIM35')).toBe(true);
    expect(canReviewBatch('superAdmin', [], 'BIM43')).toBe(true);
  });

  it('lets a batch moderator review only their assigned batch(es)', () => {
    expect(canReviewBatch('batchModerator', ['BIM35'], 'BIM35')).toBe(true);
    expect(canReviewBatch('batchModerator', ['BIM35'], 'BIM43')).toBe(false);
    expect(canReviewBatch('batchModerator', undefined, 'BIM35')).toBe(false);
  });

  it('denies non-reviewer roles entirely', () => {
    expect(canReviewBatch('member', ['BIM35'], 'BIM35')).toBe(false);
    expect(canReviewBatch('pending', undefined, 'BIM35')).toBe(false);
  });
});
