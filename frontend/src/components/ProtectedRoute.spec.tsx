import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (isAuthenticated: boolean) =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProtectedRoute', () => {
  describe('when authenticated', () => {
    it('renders the children', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      renderWithRouter(true);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('does not redirect to /login', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      renderWithRouter(true);
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('when not authenticated', () => {
    it('redirects to /login', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      renderWithRouter(false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('does not render the children', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      renderWithRouter(false);
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
