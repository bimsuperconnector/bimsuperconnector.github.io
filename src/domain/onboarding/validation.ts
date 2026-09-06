import type { OrganizationEntry } from './types';

export interface ApplicationDraft {
  name: string;
  batchId: string;
  city: string;
  region: string;
  country: string;
  educationInstitution: string;
  educationDegree: string;
  currentOrgName: string;
  currentOrgRole: string;
  currentOrgIsStartup: boolean;
  previousOrganizations: OrganizationEntry[];
  skills: string;
  interests: string;
  networkingGoals: string;
  photoDataUrl: string | null;
}

export type FieldErrors = Partial<Record<keyof ApplicationDraft, string>>;

export function validateApplicationDraft(draft: ApplicationDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.name.trim()) errors.name = 'Enter your full name.';
  if (!draft.batchId) errors.batchId = 'Select your BIM batch.';
  if (!draft.city.trim()) errors.city = 'Enter your current city.';
  if (!draft.country.trim()) errors.country = 'Enter your current country.';
  if (!draft.educationInstitution.trim()) {
    errors.educationInstitution = 'Enter your educational institution.';
  }
  if (!draft.currentOrgName.trim()) {
    errors.currentOrgName = 'Enter your current organization.';
  }
  if (!draft.currentOrgRole.trim()) {
    errors.currentOrgRole = 'Enter your current role.';
  }
  if (!draft.photoDataUrl) {
    errors.photoDataUrl = 'Add a profile photo.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Parses a comma/newline-separated free-text field into a clean, de-duplicated tag list. */
export function parseTagList(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const piece of raw.split(/[,\n]/)) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

// --- Photo validation -------------------------------------------------

export const ACCEPTED_PHOTO_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/** Generous pre-compression ceiling so we don't hang the browser trying
 * to decode an enormous file; the on-device compressor brings whatever
 * gets through this down to a few tens of KB before it ever reaches
 * Firestore. */
export const MAX_PHOTO_SOURCE_BYTES = 8 * 1024 * 1024;

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_MIME_TYPES.includes(file.type)) {
    return 'Please upload a JPEG, PNG, or WEBP image.';
  }
  if (file.size > MAX_PHOTO_SOURCE_BYTES) {
    return 'That image is too large (max 8 MB). Please choose a smaller photo.';
  }
  if (file.size === 0) {
    return 'That file appears to be empty or broken. Please choose another photo.';
  }
  return null;
}
