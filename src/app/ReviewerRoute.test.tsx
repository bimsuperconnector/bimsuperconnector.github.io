import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ReviewerRoute } from './ReviewerRoute';
import { useAuth } from '../features/auth/AuthContext';
import { useUserRecord } from '../features/onboarding/useUserRecord';

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../features/onboarding/useUserRecord', () => ({
  useUserRecord: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserRecord = vi.mocked(useUserRecord);

function renderReviewer() {
  return render(
    <MemoryRouter initialEntries={['/review']}>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route
          path="/review"
          element={
            <ReviewerRoute>
              <div>Review queue</div>
            </ReviewerRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function baseUser() {
  return {
    user: { uid: 'mod1' } as never,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  };
}

describe('ReviewerRoute', () => {
  it('redirects non-reviewers (e.g. plain members) to /dashboard', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: { uid: 'mod1', role: 'member' } as never,
      loading: false,
      error: null,
    });

    renderReviewer();

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('renders the review queue for a batch moderator', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: {
        uid: 'mod1',
        role: 'batchModerator',
        assignedBatches: ['BIM35'],
      } as never,
      loading: false,
      error: null,
    });

    renderReviewer();

    expect(screen.getByText('Review queue')).toBeInTheDocument();
  });

  it('renders the review queue for an admin role', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: { uid: 'mod1', role: 'applicationAdmin' } as never,
      loading: false,
      error: null,
    });

    renderReviewer();

    expect(screen.getByText('Review queue')).toBeInTheDocument();
  });
});
