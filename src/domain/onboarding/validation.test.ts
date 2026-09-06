import { describe, expect, it } from 'vitest';
import {
  hasErrors,
  parseTagList,
  validateApplicationDraft,
  validateProfileEditDraft,
  validatePhotoFile,
  type ApplicationDraft,
  type ProfileEditDraft,
} from './validation';

function baseDraft(
  overrides: Partial<ApplicationDraft> = {},
): ApplicationDraft {
  return {
    name: 'Alice Alumni',
    batchId: 'BIM35',
    city: 'Bengaluru',
    region: '',
    country: 'India',
    educationInstitution: 'Test University',
    educationDegree: '',
    currentOrgName: 'Acme',
    currentOrgRole: 'Engineer',
    currentOrgIsStartup: false,
    previousOrganizations: [],
    skills: '',
    interests: '',
    networkingGoals: '',
    photoDataUrl: 'data:image/jpeg;base64,AAAA',
    ...overrides,
  };
}

describe('validateApplicationDraft', () => {
  it('accepts a fully-filled valid draft', () => {
    expect(hasErrors(validateApplicationDraft(baseDraft()))).toBe(false);
  });

  it('requires name, batch, city, country, institution, current org name/role, and photo', () => {
    const errors = validateApplicationDraft(
      baseDraft({
        name: '',
        batchId: '',
        city: '',
        country: '',
        educationInstitution: '',
        currentOrgName: '',
        currentOrgRole: '',
        photoDataUrl: null,
      }),
    );

    expect(errors.name).toBeDefined();
    expect(errors.batchId).toBeDefined();
    expect(errors.city).toBeDefined();
    expect(errors.country).toBeDefined();
    expect(errors.educationInstitution).toBeDefined();
    expect(errors.currentOrgName).toBeDefined();
    expect(errors.currentOrgRole).toBeDefined();
    expect(errors.photoDataUrl).toBeDefined();
  });

  it('treats whitespace-only input as missing', () => {
    const errors = validateApplicationDraft(baseDraft({ name: '   ' }));
    expect(errors.name).toBeDefined();
  });

  it('does not require region/degree/skills/interests/networking goals', () => {
    const errors = validateApplicationDraft(baseDraft());
    expect(errors.region).toBeUndefined();
    expect(errors.educationDegree).toBeUndefined();
    expect(errors.skills).toBeUndefined();
  });
});

function baseProfileEditDraft(
  overrides: Partial<ProfileEditDraft> = {},
): ProfileEditDraft {
  return {
    name: 'Alice Alumni',
    city: 'Bengaluru',
    region: '',
    country: 'India',
    educationInstitution: 'Test University',
    educationDegree: '',
    currentOrgName: 'Acme',
    currentOrgRole: 'Engineer',
    currentOrgIsStartup: false,
    previousOrganizations: [],
    skills: '',
    interests: '',
    networkingGoals: '',
    photoDataUrl: 'data:image/jpeg;base64,AAAA',
    ...overrides,
  };
}

describe('validateProfileEditDraft', () => {
  it('accepts a fully-filled valid draft, with no batch field to check', () => {
    const errors = validateProfileEditDraft(baseProfileEditDraft());
    expect(hasErrors(errors)).toBe(false);
    expect('batchId' in errors).toBe(false);
  });

  it('requires name, city, country, institution, current org name/role, and photo', () => {
    const errors = validateProfileEditDraft(
      baseProfileEditDraft({
        name: '',
        city: '',
        country: '',
        educationInstitution: '',
        currentOrgName: '',
        currentOrgRole: '',
        photoDataUrl: null,
      }),
    );

    expect(errors.name).toBeDefined();
    expect(errors.city).toBeDefined();
    expect(errors.country).toBeDefined();
    expect(errors.educationInstitution).toBeDefined();
    expect(errors.currentOrgName).toBeDefined();
    expect(errors.currentOrgRole).toBeDefined();
    expect(errors.photoDataUrl).toBeDefined();
  });

  it('does not require region/degree/skills/interests/networking goals', () => {
    const errors = validateProfileEditDraft(baseProfileEditDraft());
    expect(errors.region).toBeUndefined();
    expect(errors.educationDegree).toBeUndefined();
    expect(errors.skills).toBeUndefined();
  });
});

describe('parseTagList', () => {
  it('splits on commas and newlines, trims, and de-duplicates case-insensitively', () => {
    expect(parseTagList('Revit, revit,\nStructural Analysis,  ,BIM')).toEqual([
      'Revit',
      'Structural Analysis',
      'BIM',
    ]);
  });

  it('returns an empty array for blank input', () => {
    expect(parseTagList('   ')).toEqual([]);
  });
});

describe('validatePhotoFile', () => {
  function file(type: string, size: number): File {
    return new File([new Uint8Array(Math.max(size, 1))], 'photo', { type });
  }

  it('accepts a reasonably-sized jpeg/png/webp', () => {
    expect(validatePhotoFile(file('image/jpeg', 1024))).toBeNull();
    expect(validatePhotoFile(file('image/png', 1024))).toBeNull();
    expect(validatePhotoFile(file('image/webp', 1024))).toBeNull();
  });

  it('rejects unsupported mime types', () => {
    expect(validatePhotoFile(file('application/pdf', 1024))).toMatch(
      /JPEG|PNG|WEBP/,
    );
  });

  it('rejects oversized files', () => {
    expect(validatePhotoFile(file('image/jpeg', 9 * 1024 * 1024))).toMatch(
      /too large/i,
    );
  });

  it('rejects an empty (broken) file', () => {
    const empty = new File([], 'photo', { type: 'image/jpeg' });
    expect(validatePhotoFile(empty)).toMatch(/empty or broken/i);
  });
});
