import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ApplicationDraft } from '../../domain/onboarding/validation';
import { parseTagList } from '../../domain/onboarding/validation';
import { buildNormalizedLocation } from '../../config/locations';
import type {
  ProfileApplication,
  UserRecord,
} from '../../domain/onboarding/types';

export function usersCollection() {
  return collection(db, 'users');
}

export function profilesCollection() {
  return collection(db, 'profiles');
}

export function userDocRef(uid: string) {
  return doc(db, 'users', uid);
}

export function profileDocRef(uid: string) {
  return doc(db, 'profiles', uid);
}

/** Subscribes to the caller's own (or, for a reviewer, a reviewed
 * applicant's) account record. Calls back with `null` if the doc does
 * not exist yet (person has not applied). */
export function subscribeToUserRecord(
  uid: string,
  onNext: (record: UserRecord | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snapshot) =>
      onNext(snapshot.exists() ? (snapshot.data() as UserRecord) : null),
    onError,
  );
}

export async function fetchProfile(
  uid: string,
): Promise<ProfileApplication | null> {
  const snapshot = await getDoc(profileDocRef(uid));
  return snapshot.exists() ? (snapshot.data() as ProfileApplication) : null;
}

interface SubmitAccountInfo {
  email: string | null;
  fallbackDisplayName: string;
}

/**
 * Creates the `/users/{uid}` and `/profiles/{uid}` documents together
 * as one atomic batched write, so the denormalized `batchId` on
 * `/users` (used for batch-moderator-scoped review queries) can never
 * drift from the profile's own `batchId`. This is a create-only
 * operation in Phase 1 — see ProfileApplication's doc comment for why
 * there is no corresponding "edit" path yet.
 */
export async function submitApplication(
  uid: string,
  account: SubmitAccountInfo,
  draft: ApplicationDraft,
): Promise<void> {
  if (!draft.photoDataUrl) {
    throw new Error('A profile photo is required.');
  }

  const name = draft.name.trim();
  const location = buildNormalizedLocation(
    draft.city,
    draft.region,
    draft.country,
  );
  const now = serverTimestamp();

  const profile: Omit<ProfileApplication, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid,
    name,
    photoDataUrl: draft.photoDataUrl,
    batchId: draft.batchId,
    location,
    education: {
      institution: draft.educationInstitution.trim(),
      ...(draft.educationDegree.trim()
        ? { degree: draft.educationDegree.trim() }
        : {}),
    },
    currentOrganization: {
      name: draft.currentOrgName.trim(),
      role: draft.currentOrgRole.trim(),
      isStartup: draft.currentOrgIsStartup,
    },
    previousOrganizations: draft.previousOrganizations
      .filter((entry) => entry.name.trim() || entry.role.trim())
      .map((entry) => ({
        name: entry.name.trim(),
        role: entry.role.trim(),
        isStartup: entry.isStartup,
      })),
    skills: parseTagList(draft.skills),
    interests: parseTagList(draft.interests),
    networkingGoals: draft.networkingGoals.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(userDocRef(uid), {
    uid,
    email: account.email,
    displayName: name || account.fallbackDisplayName,
    batchId: draft.batchId,
    role: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  batch.set(profileDocRef(uid), profile);
  await batch.commit();
}

/** Resets a rejected application back to pending for another look.
 * Does not change any profile content — Phase 1 has no profile-edit
 * screen; Phase 2 adds controlled editing. */
export async function requestAnotherReview(uid: string): Promise<void> {
  await updateDoc(userDocRef(uid), {
    role: 'pending',
    rejectionReason: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export interface ReviewerContext {
  role: UserRecord['role'];
  assignedBatches?: string[];
}

/** Fetches pending applications the given reviewer is authorized to
 * see: all of them for admin roles, or only their assigned batch(es)
 * for a batch moderator. Mirrors the scoping in
 * firebase/firestore.rules `canReview()`. */
export async function fetchPendingApplications(
  reviewer: ReviewerContext,
): Promise<UserRecord[]> {
  const isAdmin =
    reviewer.role === 'applicationAdmin' ||
    reviewer.role === 'platformAdmin' ||
    reviewer.role === 'superAdmin';

  const q = isAdmin
    ? query(usersCollection(), where('role', '==', 'pending'))
    : query(
        usersCollection(),
        where('role', '==', 'pending'),
        where(
          'batchId',
          'in',
          reviewer.assignedBatches?.length
            ? reviewer.assignedBatches.slice(0, 10)
            : ['__none__'],
        ),
      );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data() as UserRecord);
}

export async function approveApplication(
  reviewerUid: string,
  targetUid: string,
): Promise<void> {
  await updateDoc(userDocRef(targetUid), {
    role: 'member',
    reviewedBy: reviewerUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    rejectionReason: deleteField(),
  });
}

export async function rejectApplication(
  reviewerUid: string,
  targetUid: string,
  reason: string,
): Promise<void> {
  const trimmedReason = reason.trim();
  await updateDoc(userDocRef(targetUid), {
    role: 'rejected',
    reviewedBy: reviewerUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(trimmedReason
      ? { rejectionReason: trimmedReason }
      : { rejectionReason: deleteField() }),
  });
}
