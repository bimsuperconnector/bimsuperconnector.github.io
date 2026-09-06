import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from './useProfile';
import { updateProfile } from '../../services/firebase/firestore';
import type { ProfileApplication } from '../../domain/onboarding/types';

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('./useProfile', () => ({ useProfile: vi.fn() }));
vi.mock('../../services/firebase/firestore', () => ({
  updateProfile: vi.fn(),
  fetchProfile: vi.fn(),
}));
vi.mock('../../domain/onboarding/photo', () => ({
  compressPhotoFile: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseProfile = vi.mocked(useProfile);
const mockUpdateProfile = vi.mocked(updateProfile);

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
    currentOrganization: { name: 'Acme', role: 'Engineer', isStartup: true },
    previousOrganizations: [],
    skills: ['Revit'],
    interests: ['Design'],
    networkingGoals: '',
    createdAt: 'irrelevant' as never,
    updatedAt: 'irrelevant' as never,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { uid: 'alice' } as never,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  });
});

describe('ProfilePage', () => {
  it('shows a loading state', () => {
    mockUseProfile.mockReturnValue({
      profile: undefined,
      loading: true,
      error: null,
      reload: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('renders the profile in view mode by default, including the startup marker', () => {
    mockUseProfile.mockReturnValue({
      profile: sampleProfile(),
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText('Alice Alumni')).toBeInTheDocument();
    expect(screen.getByText(/acme/i)).toBeInTheDocument();
    expect(screen.getByText(/startup/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save changes/i }),
    ).not.toBeInTheDocument();
  });

  it('switches to edit mode, saves, and returns to view mode', async () => {
    const reload = vi.fn();
    mockUseProfile.mockReturnValue({
      profile: sampleProfile(),
      loading: false,
      error: null,
      reload,
    });
    mockUpdateProfile.mockResolvedValue(undefined);

    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(
      screen.getByRole('button', { name: /save changes/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/profile has been updated/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save changes/i }),
    ).not.toBeInTheDocument();
  });

  it('cancels out of edit mode without saving', () => {
    mockUseProfile.mockReturnValue({
      profile: sampleProfile(),
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(
      screen.queryByRole('button', { name: /save changes/i }),
    ).not.toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
