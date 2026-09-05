import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../features/auth/AuthContext';

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Secret dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while auth is resolving', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderProtected();

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /login when signed out', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });

  it('renders the protected content when signed in', () => {
    mockUseAuth.mockReturnValue({
      // Only the fields ProtectedRoute reads are needed for this test.
      user: { uid: 'abc123' } as never,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
  });
});
