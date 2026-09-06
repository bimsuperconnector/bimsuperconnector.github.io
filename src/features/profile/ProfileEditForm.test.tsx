import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProfileEditForm } from './ProfileEditForm';
import { updateProfile } from '../../services/firebase/firestore';
import { compressPhotoFile } from '../../domain/onboarding/photo';
import type { ProfileApplication } from '../../domain/onboarding/types';

vi.mock('../../services/firebase/firestore', () => ({
  updateProfile: vi.fn(),
}));
vi.mock('../../domain/onboarding/photo', () => ({
  compressPhotoFile: vi.fn(),
}));

const mockUpdateProfile = vi.mocked(updateProfile);
const mockCompressPhotoFile = vi.mocked(compressPhotoFile);

function sampleProfile(): ProfileApplication {
  return {
    uid: 'alice',
    name: 'Alice Alumni',
    photoDataUrl: 'data:image/jpeg;base64,AAAA',
    batchId: 'BIM35',
    location: {
      city: 'Bengaluru',
      region: '',
      country: 'India',
      normalized: 'bengaluru||india',
    },
    education: { institution: 'Test University' },
    currentOrganization: { name: 'Acme', role: 'Engineer', isStartup: false },
    previousOrganizations: [],
    skills: ['Revit'],
    interests: ['Design'],
    networkingGoals: 'Meet more alumni',
    createdAt: 'irrelevant' as never,
    updatedAt: 'irrelevant' as never,
  };
}

function renderForm(onSaved = vi.fn(), onCancel = vi.fn()) {
  return {
    onSaved,
    onCancel,
    ...render(
      <ProfileEditForm
        uid="alice"
        profile={sampleProfile()}
        onSaved={onSaved}
        onCancel={onCancel}
      />,
    ),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfileEditForm', () => {
  it('pre-fills fields from the existing profile', () => {
    renderForm();

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Alice Alumni');
    expect(screen.getByLabelText(/^city$/i)).toHaveValue('Bengaluru');
    expect(screen.getByLabelText(/^country$/i)).toHaveValue('India');
    expect(screen.getByLabelText(/institution/i)).toHaveValue(
      'Test University',
    );
    expect(screen.getByLabelText(/^organization$/i)).toHaveValue('Acme');
    expect(screen.getByLabelText(/role \/ title/i)).toHaveValue('Engineer');
  });

  it('shows the frozen batch as read-only text, not a selector', () => {
    renderForm();

    expect(screen.getByText(/bim batch/i)).toBeInTheDocument();
    expect(screen.getByText(/bim35/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows validation errors and does not save when a required field is cleared', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      await screen.findByText(/enter your full name/i),
    ).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('saves edited fields and calls onSaved', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    const { onSaved } = renderForm();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alice A. Alumni' },
    });
    fireEvent.change(screen.getByLabelText(/role \/ title/i), {
      target: { value: 'Senior Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
    const [uid, draft] = mockUpdateProfile.mock.calls[0];
    expect(uid).toBe('alice');
    expect(draft.name).toBe('Alice A. Alumni');
    expect(draft.currentOrgRole).toBe('Senior Engineer');
    expect('batchId' in draft).toBe(false);
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  });

  it('processes a replacement photo through the same compressor as onboarding', async () => {
    mockCompressPhotoFile.mockResolvedValue('data:image/jpeg;base64,BBBB');
    renderForm();

    const fileInput = screen.getByLabelText(/profile photo/i);
    const goodFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [goodFile] } });

    await waitFor(() => expect(mockCompressPhotoFile).toHaveBeenCalled());
    await screen.findByAltText(/selected profile preview/i);
  });

  it('calls onCancel without saving', () => {
    const { onCancel } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
