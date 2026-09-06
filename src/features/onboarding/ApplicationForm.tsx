import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { getBatchOptions } from '../../config/batches';
import {
  hasErrors,
  validateApplicationDraft,
  validatePhotoFile,
  type ApplicationDraft,
  type FieldErrors,
} from '../../domain/onboarding/validation';
import { compressPhotoFile } from '../../domain/onboarding/photo';
import { submitApplication } from '../../services/firebase/firestore';
import type { OrganizationEntry } from '../../domain/onboarding/types';

const BATCH_OPTIONS = getBatchOptions();

function emptyOrganization(): OrganizationEntry {
  return { name: '', role: '', isStartup: false };
}

function emptyDraft(defaultName: string): ApplicationDraft {
  return {
    name: defaultName,
    batchId: '',
    city: '',
    region: '',
    country: '',
    educationInstitution: '',
    educationDegree: '',
    currentOrgName: '',
    currentOrgRole: '',
    currentOrgIsStartup: false,
    previousOrganizations: [],
    skills: '',
    interests: '',
    networkingGoals: '',
    photoDataUrl: null,
  };
}

interface ApplicationFormProps {
  uid: string;
  account: { email: string | null; fallbackDisplayName: string };
}

export function ApplicationForm({ uid, account }: ApplicationFormProps) {
  const [draft, setDraft] = useState<ApplicationDraft>(() =>
    emptyDraft(account.fallbackDisplayName),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formId = useId();

  function updateField<K extends keyof ApplicationDraft>(
    key: K,
    value: ApplicationDraft[K],
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
        emptyOrganization(),
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
      // Allow re-selecting the same file name after an error.
      event.target.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateApplicationDraft(draft);
    setErrors(fieldErrors);
    setSubmitError(null);

    if (hasErrors(fieldErrors)) return;

    setSubmitting(true);
    try {
      await submitApplication(uid, account, draft);
      // No local "success" state needed: the caller re-renders based on
      // the now-created /users/{uid} doc via the real-time subscription.
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not submit your application. Please try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="application-form" onSubmit={handleSubmit} noValidate>
      <p className="form-intro">
        This information is shared with alumni you connect with and with
        moderators reviewing your application. See the{' '}
        <a href="/privacy">Privacy Policy</a> for details.
      </p>

      {submitError && (
        <p role="alert" className="form-error">
          {submitError}
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

        <Field id={`${formId}-batch`} label="BIM batch" error={errors.batchId}>
          <select
            id={`${formId}-batch`}
            value={draft.batchId}
            aria-invalid={!!errors.batchId}
            onChange={(e) => updateField('batchId', e.target.value)}
            required
          >
            <option value="">Select your batch…</option>
            {BATCH_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
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

      <fieldset className="form-fieldset">
        <legend>Current organization</legend>
        <Field
          id={`${formId}-current-org-name`}
          label="Organization"
          error={errors.currentOrgName}
        >
          <input
            id={`${formId}-current-org-name`}
            type="text"
            value={draft.currentOrgName}
            aria-invalid={!!errors.currentOrgName}
            onChange={(e) => updateField('currentOrgName', e.target.value)}
            required
          />
        </Field>
        <Field
          id={`${formId}-current-org-role`}
          label="Role / title"
          error={errors.currentOrgRole}
        >
          <input
            id={`${formId}-current-org-role`}
            type="text"
            value={draft.currentOrgRole}
            aria-invalid={!!errors.currentOrgRole}
            onChange={(e) => updateField('currentOrgRole', e.target.value)}
            required
          />
        </Field>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={draft.currentOrgIsStartup}
            onChange={(e) =>
              updateField('currentOrgIsStartup', e.target.checked)
            }
          />
          This is my own startup / venture
        </label>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Previous organizations (optional)</legend>
        {draft.previousOrganizations.map((entry, index) => (
          <div className="previous-org-row" key={index}>
            <label className="sr-only" htmlFor={`${formId}-prev-name-${index}`}>
              Previous organization {index + 1} name
            </label>
            <input
              id={`${formId}-prev-name-${index}`}
              type="text"
              placeholder="Organization"
              value={entry.name}
              onChange={(e) =>
                updatePreviousOrg(index, { name: e.target.value })
              }
            />
            <label className="sr-only" htmlFor={`${formId}-prev-role-${index}`}>
              Previous organization {index + 1} role
            </label>
            <input
              id={`${formId}-prev-role-${index}`}
              type="text"
              placeholder="Role"
              value={entry.role}
              onChange={(e) =>
                updatePreviousOrg(index, { role: e.target.value })
              }
            />
            <label className="form-checkbox form-checkbox-inline">
              <input
                type="checkbox"
                checked={entry.isStartup}
                onChange={(e) =>
                  updatePreviousOrg(index, { isStartup: e.target.checked })
                }
              />
              Startup
            </label>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => removePreviousOrg(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary"
          onClick={addPreviousOrg}
        >
          Add another organization
        </button>
      </fieldset>

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

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting || photoProcessing}
      >
        {submitting ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
