import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { findBatchOption } from '../../config/batches';
import {
  hasErrors,
  validateProfileEditDraft,
  validatePhotoFile,
  type ProfileEditDraft,
  type ProfileFieldErrors,
} from '../../domain/onboarding/validation';
import { compressPhotoFile } from '../../domain/onboarding/photo';
import { updateProfile } from '../../services/firebase/firestore';
import type {
  OrganizationEntry,
  ProfileApplication,
} from '../../domain/onboarding/types';
import { Field } from '../../components/FormField';
import { OrganizationHistoryFieldset } from '../../components/OrganizationHistoryFieldset';

function draftFromProfile(profile: ProfileApplication): ProfileEditDraft {
  return {
    name: profile.name,
    city: profile.location.city,
    region: profile.location.region,
    country: profile.location.country,
    educationInstitution: profile.education.institution,
    educationDegree: profile.education.degree ?? '',
    currentOrgName: profile.currentOrganization.name,
    currentOrgRole: profile.currentOrganization.role,
    currentOrgIsStartup: profile.currentOrganization.isStartup,
    previousOrganizations: profile.previousOrganizations,
    skills: profile.skills.join(', '),
    interests: profile.interests.join(', '),
    networkingGoals: profile.networkingGoals,
    photoDataUrl: profile.photoDataUrl,
  };
}

interface ProfileEditFormProps {
  uid: string;
  profile: ProfileApplication;
  onSaved: () => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  uid,
  profile,
  onSaved,
  onCancel,
}: ProfileEditFormProps) {
  const [draft, setDraft] = useState<ProfileEditDraft>(() =>
    draftFromProfile(profile),
  );
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const formId = useId();
  const batch = findBatchOption(profile.batchId);

  function updateField<K extends keyof ProfileEditDraft>(
    key: K,
    value: ProfileEditDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updatePreviousOrg(index: number, patch: Partial<OrganizationEntry>) {
    setDraft((prev) => ({
      ...prev,
      previousOrganizations: prev.previousOrganizations.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function addPreviousOrg() {
    setDraft((prev) => ({
      ...prev,
      previousOrganizations: [
        ...prev.previousOrganizations,
        { name: '', role: '', isStartup: false },
      ],
    }));
  }

  function removePreviousOrg(index: number) {
    setDraft((prev) => ({
      ...prev,
      previousOrganizations: prev.previousOrganizations.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    setPhotoError(null);
    setPhotoProcessing(true);
    try {
      const dataUrl = await compressPhotoFile(file);
      updateField('photoDataUrl', dataUrl);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Could not process that photo.',
      );
    } finally {
      setPhotoProcessing(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateProfileEditDraft(draft);
    setErrors(fieldErrors);
    setSaveError(null);

    if (hasErrors(fieldErrors)) return;

    setSaving(true);
    try {
      await updateProfile(uid, draft);
      onSaved();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Could not save your profile. Please try again.',
      );
      setSaving(false);
    }
  }

  return (
    <form className="application-form" onSubmit={handleSubmit} noValidate>
      {saveError && (
        <p role="alert" className="form-error">
          {saveError}
        </p>
      )}

      <fieldset className="form-fieldset">
        <legend>Basic information</legend>

        <Field id={`${formId}-name`} label="Full name" error={errors.name}>
          <input
            id={`${formId}-name`}
            type="text"
            value={draft.name}
            aria-invalid={!!errors.name}
            onChange={(e) => updateField('name', e.target.value)}
            autoComplete="name"
            required
          />
        </Field>

        <div className="form-field">
          <label htmlFor={`${formId}-photo`}>Profile photo</label>
          {draft.photoDataUrl && (
            <img
              src={draft.photoDataUrl}
              alt="Selected profile preview"
              className="photo-preview"
              width={96}
              height={96}
            />
          )}
          <input
            id={`${formId}-photo`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            aria-invalid={!!(errors.photoDataUrl || photoError)}
            aria-describedby={photoError ? `${formId}-photo-error` : undefined}
          />
          {photoProcessing && <p role="status">Processing photo…</p>}
          {(photoError || errors.photoDataUrl) && (
            <p role="alert" id={`${formId}-photo-error`} className="form-error">
              {photoError ?? errors.photoDataUrl}
            </p>
          )}
        </div>

        <div className="form-field">
          <span className="form-static-label">BIM batch</span>
          <p className="form-static-value">
            {batch?.label ?? profile.batchId}
            <span className="form-hint form-static-note">
              {' '}
              — batch can&apos;t be changed here; contact an admin if this is
              wrong.
            </span>
          </p>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Location</legend>
        <Field id={`${formId}-city`} label="City" error={errors.city}>
          <input
            id={`${formId}-city`}
            type="text"
            value={draft.city}
            aria-invalid={!!errors.city}
            onChange={(e) => updateField('city', e.target.value)}
            required
          />
        </Field>
        <Field id={`${formId}-region`} label="State / region (optional)">
          <input
            id={`${formId}-region`}
            type="text"
            value={draft.region}
            onChange={(e) => updateField('region', e.target.value)}
          />
        </Field>
        <Field id={`${formId}-country`} label="Country" error={errors.country}>
          <input
            id={`${formId}-country`}
            type="text"
            value={draft.country}
            aria-invalid={!!errors.country}
            onChange={(e) => updateField('country', e.target.value)}
            required
          />
        </Field>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Education</legend>
        <Field
          id={`${formId}-institution`}
          label="Institution"
          error={errors.educationInstitution}
        >
          <input
            id={`${formId}-institution`}
            type="text"
            value={draft.educationInstitution}
            aria-invalid={!!errors.educationInstitution}
            onChange={(e) =>
              updateField('educationInstitution', e.target.value)
            }
            required
          />
        </Field>
        <Field id={`${formId}-degree`} label="Degree (optional)">
          <input
            id={`${formId}-degree`}
            type="text"
            value={draft.educationDegree}
            onChange={(e) => updateField('educationDegree', e.target.value)}
          />
        </Field>
      </fieldset>

      <OrganizationHistoryFieldset
        formId={formId}
        currentOrgName={draft.currentOrgName}
        currentOrgRole={draft.currentOrgRole}
        currentOrgIsStartup={draft.currentOrgIsStartup}
        currentOrgNameError={errors.currentOrgName}
        currentOrgRoleError={errors.currentOrgRole}
        onChangeCurrentOrgName={(value) => updateField('currentOrgName', value)}
        onChangeCurrentOrgRole={(value) => updateField('currentOrgRole', value)}
        onChangeCurrentOrgIsStartup={(value) =>
          updateField('currentOrgIsStartup', value)
        }
        previousOrganizations={draft.previousOrganizations}
        onUpdatePrevious={updatePreviousOrg}
        onAddPrevious={addPreviousOrg}
        onRemovePrevious={removePreviousOrg}
      />

      <fieldset className="form-fieldset">
        <legend>Skills &amp; interests</legend>
        <Field
          id={`${formId}-skills`}
          label="Skills (comma-separated)"
          hint="e.g. Revit, structural analysis, project management"
        >
          <textarea
            id={`${formId}-skills`}
            value={draft.skills}
            onChange={(e) => updateField('skills', e.target.value)}
            rows={2}
          />
        </Field>
        <Field
          id={`${formId}-interests`}
          label="Interests (comma-separated)"
          hint="e.g. sustainability, urban design, entrepreneurship"
        >
          <textarea
            id={`${formId}-interests`}
            value={draft.interests}
            onChange={(e) => updateField('interests', e.target.value)}
            rows={2}
          />
        </Field>
        <Field
          id={`${formId}-networking`}
          label="What are you hoping to get from the network? (optional)"
        >
          <textarea
            id={`${formId}-networking`}
            value={draft.networkingGoals}
            onChange={(e) => updateField('networkingGoals', e.target.value)}
            rows={2}
          />
        </Field>
      </fieldset>

      <div className="profile-edit-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={saving || photoProcessing}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
