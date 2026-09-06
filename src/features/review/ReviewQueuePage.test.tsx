import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReviewQueuePage } from './ReviewQueuePage';
import { useAuth } from '../auth/AuthContext';
import { useUserRecord } from '../onboarding/useUserRecord';
import {
  approveApplication,
  fetchPendingApplications,
  fetchProfile,
  rejectApplication,
} from '../../services/firebase/firestore';

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../onboarding/useUserRecord', () => ({ useUserRecord: vi.fn() }));
vi.mock('../../services/firebase/firestore', () => ({
  fetchPendingApplications: vi.fn(),
  fetchProfile: vi.fn(),
  approveApplication: vi.fn(),
  rejectApplication: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserRecord = vi.mocked(useUserRecord);
const mockFetchPending = vi.mocked(fetchPendingApplications);
const mockFetchProfile = vi.mocked(fetchProfile);
const mockApprove = vi.mocked(approveApplication);
const mockReject = vi.mocked(rejectApplication);

function sampleProfile() {
  return {
    uid: 'alice',
    name: 'Alice Alumni',
    photoDataUrl: 'data:image/jpeg;base64,AAAA',
    batchId: 'BIM35',
    location: {
      city: 'Bengaluru',
      region: '',
      country: 'India',
      normalized: 'bengaluru|india',
    },
    education: { institution: 'Test University' },
    currentOrganization: { name: 'Acme', role: 'Engineer', isStartup: false },
    previousOrganizations: [],
    skills: [],
    interests: [],
    networkingGoals: '',
  } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { uid: 'mod1' } as never,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  });
  mockUseUserRecord.mockReturnValue({
    record: {
      uid: 'mod1',
      role: 'batchModerator',
      assignedBatches: ['BIM35'],
    } as never,
    loading: false,
    error: null,
  });
});

describe('ReviewQueuePage', () => {
  it('shows a message when there are no pending applications', async () => {
    mockFetchPending.mockResolvedValue([]);
    render(<ReviewQueuePage />);
    expect(
      await screen.findByText(/no pending applications/i),
    ).toBeInTheDocument();
  });

  it('lists pending applicants and opens application detail', async () => {
    mockFetchPending.mockResolvedValue([
      {
        uid: 'alice',
        displayName: 'Alice Alumni',
        batchId: 'BIM35',
        role: 'pending',
      } as never,
    ]);
    mockFetchProfile.mockResolvedValue(sampleProfile());

    render(<ReviewQueuePage />);

    const item = await screen.findByText('Alice Alumni');
    fireEvent.click(item);

    await waitFor(() => expect(mockFetchProfile).toHaveBeenCalledWith('alice'));
    expect(await screen.findByText('Acme — Engineer')).toBeInTheDocument();
  });

  it('approves an applicant', async () => {
    mockFetchPending.mockResolvedValue([
      {
        uid: 'alice',
        displayName: 'Alice Alumni',
        batchId: 'BIM35',
        role: 'pending',
      } as never,
    ]);
    mockFetchProfile.mockResolvedValue(sampleProfile());
    mockApprove.mockResolvedValue(undefined);

    render(<ReviewQueuePage />);

    fireEvent.click(await screen.findByText('Alice Alumni'));
    await screen.findByText('Acme — Engineer');

    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() =>
      expect(mockApprove).toHaveBeenCalledWith('mod1', 'alice'),
    );
  });

  it('rejects an applicant with a reason', async () => {
    mockFetchPending.mockResolvedValue([
      {
        uid: 'alice',
        displayName: 'Alice Alumni',
        batchId: 'BIM35',
        role: 'pending',
      } as never,
    ]);
    mockFetchProfile.mockResolvedValue(sampleProfile());
    mockReject.mockResolvedValue(undefined);

    render(<ReviewQueuePage />);

    fireEvent.click(await screen.findByText('Alice Alumni'));
    await screen.findByText('Acme — Engineer');

    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: 'Incomplete profile' },
    });
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));

    await waitFor(() =>
      expect(mockReject).toHaveBeenCalledWith(
        'mod1',
        'alice',
        'Incomplete profile',
      ),
    );
  });
});
