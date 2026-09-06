import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ApplicationForm } from './ApplicationForm';
import { submitApplication } from '../../services/firebase/firestore';
import { compressPhotoFile } from '../../domain/onboarding/photo';

vi.mock('../../services/firebase/firestore', () => ({
  submitApplication: vi.fn(),
}));
vi.mock('../../domain/onboarding/photo', () => ({
  compressPhotoFile: vi.fn(),
}));

const mockSubmitApplication = vi.mocked(submitApplication);
const mockCompressPhotoFile = vi.mocked(compressPhotoFile);

function renderForm() {
  return render(
    <ApplicationForm
      uid="alice"
      account={{
        email: 'alice@example.com',
        fallbackDisplayName: 'Alice Alumni',
      }}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ApplicationForm', () => {
  it('shows validation errors and does not submit when required fields are missing', async () => {
    renderForm();

    fireEvent.click(
      screen.getByRole('button', { name: /submit application/i }),
    );

    expect(
      await screen.findByText(/select your bim batch/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/add a profile photo/i)).toBeInTheDocument();
    expect(mockSubmitApplication).not.toHaveBeenCalled();
  });

  it('shows a photo error for an unsupported file type without calling the compressor', async () => {
    renderForm();

    const fileInput = screen.getByLabelText(/profile photo/i);
    const badFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(await screen.findByText(/jpeg, png, or webp/i)).toBeInTheDocument();
    expect(mockCompressPhotoFile).not.toHaveBeenCalled();
  });

  it('submits a fully-filled form', async () => {
    mockCompressPhotoFile.mockResolvedValue('data:image/jpeg;base64,AAAA');
    mockSubmitApplication.mockResolvedValue(undefined);

    renderForm();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alice Alumni' },
    });

    const fileInput = screen.getByLabelText(/profile photo/i);
    const goodFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [goodFile] } });
    await waitFor(() => expect(mockCompressPhotoFile).toHaveBeenCalled());
    await screen.findByAltText(/selected profile preview/i);

    fireEvent.change(screen.getByLabelText(/bim batch/i), {
      target: { value: 'BIM35' },
    });
    fireEvent.change(screen.getByLabelText(/^city$/i), {
      target: { value: 'Bengaluru' },
    });
    fireEvent.change(screen.getByLabelText(/^country$/i), {
      target: { value: 'India' },
    });
    fireEvent.change(screen.getByLabelText(/institution/i), {
      target: { value: 'Test University' },
    });
    fireEvent.change(screen.getByLabelText(/^organization$/i), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByLabelText(/role \/ title/i), {
      target: { value: 'Engineer' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /submit application/i }),
    );

    await waitFor(() => expect(mockSubmitApplication).toHaveBeenCalledTimes(1));
    const [uid, account, draft] = mockSubmitApplication.mock.calls[0];
    expect(uid).toBe('alice');
    expect(account.email).toBe('alice@example.com');
    expect(draft.name).toBe('Alice Alumni');
    expect(draft.photoDataUrl).toBe('data:image/jpeg;base64,AAAA');
  });

  it('adds and removes previous organization rows', () => {
    renderForm();

    fireEvent.click(
      screen.getByRole('button', { name: /add another organization/i }),
    );
    expect(screen.getByPlaceholderText(/^organization$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(
      screen.queryByPlaceholderText(/^organization$/i),
    ).not.toBeInTheDocument();
  });
});
