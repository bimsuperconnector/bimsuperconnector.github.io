import { Field } from './FormField';
import type { OrganizationEntry } from '../domain/onboarding/types';

/**
 * Renders the "current organization" + "previous organizations (Add
 * More)" fieldsets shared by ApplicationForm (initial application) and
 * ProfileEditForm (Phase 2 controlled self-editing). Extracted so both
 * forms stay pixel-identical and so the Add More / Remove / startup
 * marker behavior (SECURITY_AND_TESTING.md: "organization Add More;
 * startup marker") only has one implementation to test.
 */
export interface OrganizationHistoryFieldsetProps {
  formId: string;
  currentOrgName: string;
  currentOrgRole: string;
  currentOrgIsStartup: boolean;
  currentOrgNameError?: string;
  currentOrgRoleError?: string;
  onChangeCurrentOrgName: (value: string) => void;
  onChangeCurrentOrgRole: (value: string) => void;
  onChangeCurrentOrgIsStartup: (value: boolean) => void;
  previousOrganizations: OrganizationEntry[];
  onUpdatePrevious: (index: number, patch: Partial<OrganizationEntry>) => void;
  onAddPrevious: () => void;
  onRemovePrevious: (index: number) => void;
}

export function OrganizationHistoryFieldset({
  formId,
  currentOrgName,
  currentOrgRole,
  currentOrgIsStartup,
  currentOrgNameError,
  currentOrgRoleError,
  onChangeCurrentOrgName,
  onChangeCurrentOrgRole,
  onChangeCurrentOrgIsStartup,
  previousOrganizations,
  onUpdatePrevious,
  onAddPrevious,
  onRemovePrevious,
}: OrganizationHistoryFieldsetProps) {
  return (
    <>
      <fieldset className="form-fieldset">
        <legend>Current organization</legend>
        <Field
          id={`${formId}-current-org-name`}
          label="Organization"
          error={currentOrgNameError}
        >
          <input
            id={`${formId}-current-org-name`}
            type="text"
            value={currentOrgName}
            aria-invalid={!!currentOrgNameError}
            onChange={(e) => onChangeCurrentOrgName(e.target.value)}
            required
          />
        </Field>
        <Field
          id={`${formId}-current-org-role`}
          label="Role / title"
          error={currentOrgRoleError}
        >
          <input
            id={`${formId}-current-org-role`}
            type="text"
            value={currentOrgRole}
            aria-invalid={!!currentOrgRoleError}
            onChange={(e) => onChangeCurrentOrgRole(e.target.value)}
            required
          />
        </Field>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={currentOrgIsStartup}
            onChange={(e) => onChangeCurrentOrgIsStartup(e.target.checked)}
          />
          This is my own startup / venture
        </label>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Previous organizations (optional)</legend>
        {previousOrganizations.map((entry, index) => (
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
                onUpdatePrevious(index, { name: e.target.value })
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
                onUpdatePrevious(index, { role: e.target.value })
              }
            />
            <label className="form-checkbox form-checkbox-inline">
              <input
                type="checkbox"
                checked={entry.isStartup}
                onChange={(e) =>
                  onUpdatePrevious(index, { isStartup: e.target.checked })
                }
              />
              Startup
            </label>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => onRemovePrevious(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={onAddPrevious}>
          Add another organization
        </button>
      </fieldset>
    </>
  );
}
