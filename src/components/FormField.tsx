import type { ReactNode } from 'react';

/**
 * Shared labeled-field wrapper used by every form in the app
 * (ApplicationForm, ProfileEditForm, and future forms). Extracted in
 * Phase 2 so the onboarding application form and the new profile edit
 * form render fields identically instead of duplicating this markup —
 * see Design-superconnector.md's `text-input` / `text-input-focus`
 * components, applied via src/index.css's `.form-field` rules.
 */
export interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ id, label, error, hint, children }: FieldProps) {
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
