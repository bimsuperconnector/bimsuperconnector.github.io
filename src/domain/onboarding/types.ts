import type { FieldValue, Timestamp } from 'firebase/firestore';
import type { Role } from './roles';

/** A timestamp field as it appears once read back from Firestore. */
export type StoredTimestamp = Timestamp;

/**
 * `/users/{uid}` — the account + role record. This is the only place
 * the protected `role` field lives. Kept intentionally small: anything
 * that is not needed to authorize a request or list a review queue
 * lives on `/profiles/{uid}` instead.
 *
 * `batchId` is a deliberate denormalized copy of the profile's batch,
 * written once at application time and immutable afterward (enforced
 * by Firestore rules). It exists so a batch moderator's review-queue
 * query can filter `role == 'pending' && batchId in [...]` in one
 * query, without a `/profiles` list permission. See
 * FEATURE_SUPERCONNECTOR.md Phase 1 / SECURITY_AND_TESTING.md
 * "batch-moderator scope".
 */
export interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string;
  batchId: string;
  role: Role;
  /** Only meaningful when role === 'batchModerator'. Set by the owner
   * directly in the Firebase Console for now — see Phase 1 Decisions;
   * self-service assignment is Phase 11. */
  assignedBatches?: string[];
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: StoredTimestamp | null;
  createdAt: StoredTimestamp;
  updatedAt: StoredTimestamp;
}

/** Same shape as UserRecord but as written by the client (server timestamps pending). */
export type UserRecordWrite = Omit<
  UserRecord,
  'createdAt' | 'updatedAt' | 'reviewedAt'
> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export interface OrganizationEntry {
  name: string;
  role: string;
  isStartup: boolean;
}

export interface NormalizedLocation {
  city: string;
  region: string;
  country: string;
  /** Lowercase "city|region|country" join used for consistent matching/search. */
  normalized: string;
}

export interface EducationEntry {
  institution: string;
  degree?: string;
}

/**
 * `/profiles/{uid}` — the application/profile content the person
 * filled in. Owned by the account holder. In Phase 1 this collection
 * is create-only from the client (no update rule yet) because no
 * Phase 1 feature edits it after submission; Phase 2 ("Profiles &
 * batch management") is where controlled self-editing is built and
 * the corresponding `allow update` rule is added.
 */
export interface ProfileApplication {
  uid: string;
  name: string;
  /** Compressed square JPEG as a data URL — see domain/onboarding/photo.ts
   * and the Phase 1 "Decisions" note on why this isn't Firebase Storage yet. */
  photoDataUrl: string;
  batchId: string;
  location: NormalizedLocation;
  education: EducationEntry;
  currentOrganization: OrganizationEntry;
  previousOrganizations: OrganizationEntry[];
  skills: string[];
  interests: string[];
  networkingGoals: string;
  createdAt: StoredTimestamp;
  updatedAt: StoredTimestamp;
}

export type ProfileApplicationWrite = Omit<
  ProfileApplication,
  'createdAt' | 'updatedAt'
> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};
