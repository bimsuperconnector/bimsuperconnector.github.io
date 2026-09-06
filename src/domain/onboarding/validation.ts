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

/**
 * The editable subset of ApplicationDraft used by Phase 2's controlled
 * self-editing (`ProfileEditForm`). `batchId` is deliberately excluded:
 * it is a protected, frozen field (denormalized onto `/users` for
 * batch-moderator review-queue scoping — see Phase 1's
 * ProfileApplication doc comment and firebase/firestore.rules), so
 * there is no batch selector on the edit form at all.
 */
export type ProfileEditDraft = Omit<ApplicationDraft, 'batchId'>;

export type ProfileFieldErrors = Partial<
  Record<keyof ProfileEditDraft, string>
>;

/** Validation shared by both the initial application (create) and the
 * profile edit (update) flows — everything except the batch selector,
 * which only the initial application has. */
function validateSharedProfileFields(
  draft: ProfileEditDraft,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (!draft.name.trim()) errors.name = 'Enter your full name.';
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

export function validateApplicationDraft(draft: ApplicationDraft): FieldErrors {
  const errors: FieldErrors = { ...validateSharedProfileFields(draft) };
  if (!draft.batchId) errors.batchId = 'Select your BIM batch.';
  return errors;
}

/** Validates a Phase 2 profile edit draft (no batch field to check). */
export function validateProfileEditDraft(
  draft: ProfileEditDraft,
): ProfileFieldErrors {
  return validateSharedProfileFields(draft);
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
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
