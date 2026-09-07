import {
  type DocumentData,
  type Unsubscribe,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../init';

export interface OrganizationEntry {
  name: string;
  title: string;
  startYear: number | null;
  /** null = current organization */
  endYear: number | null;
  /**
   * Marks this organization as founded/owned by the member. Phase 12
   * (Entrepreneurship & organization history) reads this flag across all
   * profiles to build entrepreneurship views — organization history is
   * the source of truth, per FEATURE_SUPERCONNECTOR.md Phase 12.
   */
  isFounder: boolean;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  endYear: number | null;
}

export interface ProfileLinks {
  linkedin: string;
  website: string;
}

export interface Profile {
  uid: string;
  batchNumber: number | null;
  headline: string;
  bio: string;
  location: string;
  organizations: OrganizationEntry[];
  education: EducationEntry[];
  skills: string[];
  interests: string[];
  links: ProfileLinks;
  isComplete: boolean;
}

const ALLOWED_TOP_LEVEL_FIELDS = [
  'uid',
  'batchNumber',
  'headline',
  'bio',
  'location',
  'organizations',
  'education',
  'skills',
  'interests',
  'links',
  'isComplete',
  'createdAt',
  'updatedAt',
] as const;

function profileDocRef(uid: string) {
  if (!db) throw new Error('Firestore is not configured.');
  return doc(db, 'profiles', uid);
}

function fromSnapshot(uid: string, data: DocumentData): Profile {
  return {
    uid,
    batchNumber: typeof data.batchNumber === 'number' ? data.batchNumber : null,
    headline: data.headline ?? '',
    bio: data.bio ?? '',
    location: data.location ?? '',
    organizations: Array.isArray(data.organizations) ? data.organizations : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    interests: Array.isArray(data.interests) ? data.interests : [],
    links: {
      linkedin: data.links?.linkedin ?? '',
      website: data.links?.website ?? '',
    },
    isComplete: data.isComplete === true,
  };
}

export function emptyProfile(uid: string): Profile {
  return {
    uid,
    batchNumber: null,
    headline: '',
    bio: '',
    location: '',
    organizations: [],
    education: [],
    skills: [],
    interests: [],
    links: { linkedin: '', website: '' },
    isComplete: false,
  };
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const snapshot = await getDoc(profileDocRef(uid));
  return snapshot.exists() ? fromSnapshot(uid, snapshot.data()) : null;
}

export function subscribeToProfile(
  uid: string,
  onChange: (profile: Profile | null) => void,
): Unsubscribe {
  return onSnapshot(profileDocRef(uid), (snapshot) => {
    onChange(snapshot.exists() ? fromSnapshot(uid, snapshot.data()) : null);
  });
}

/**
 * Create-or-update, always scoped to the caller's own uid by Firestore
 * Rules (see firestore.rules). `ALLOWED_TOP_LEVEL_FIELDS` mirrors the
 * field allow-list enforced there so a client bug can't silently write an
 * unexpected key that Rules would reject anyway.
 */
export async function saveOwnProfile(uid: string, profile: Omit<Profile, 'uid'>): Promise<void> {
  const existing = await getDoc(profileDocRef(uid));
  const payload: Record<string, unknown> = {
    uid,
    ...profile,
    updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }

  const keys = Object.keys(payload);
  const unexpected = keys.filter((key) => !ALLOWED_TOP_LEVEL_FIELDS.includes(key as never));
  if (unexpected.length > 0) {
    throw new Error(`Unexpected profile fields: ${unexpected.join(', ')}`);
  }

  await setDoc(profileDocRef(uid), payload, { merge: true });
}
