import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PortalRoute } from './PortalRoute';
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

function renderPortal() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/onboarding" element={<div>Onboarding page</div>} />
        <Route
          path="/dashboard"
          element={
            <PortalRoute>
              <div>Secret dashboard</div>
            </PortalRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function baseUser() {
  return {
    user: { uid: 'abc123' } as never,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  };
}

describe('PortalRoute', () => {
  it('redirects to /login when signed out (delegates to ProtectedRoute)', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });
    mockUseUserRecord.mockReturnValue({
      record: undefined,
      loading: false,
      error: null,
    });

    renderPortal();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows a loading state while the role record resolves', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: undefined,
      loading: true,
      error: null,
    });

    renderPortal();

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /onboarding when there is no application on file', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: null,
      loading: false,
      error: null,
    });

    renderPortal();

    expect(screen.getByText('Onboarding page')).toBeInTheDocument();
  });

  it('redirects to /onboarding when pending', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: { uid: 'abc123', role: 'pending' } as never,
      loading: false,
      error: null,
    });

    renderPortal();

    expect(screen.getByText('Onboarding page')).toBeInTheDocument();
  });

  it('renders the portal for an approved role', () => {
    mockUseAuth.mockReturnValue(baseUser());
    mockUseUserRecord.mockReturnValue({
      record: { uid: 'abc123', role: 'member' } as never,
      loading: false,
      error: null,
    });

    renderPortal();

    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
  });
});
