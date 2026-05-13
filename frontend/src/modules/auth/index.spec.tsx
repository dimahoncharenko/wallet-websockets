import { render, screen, fireEvent } from '@testing-library/react';
import Auth from './index';
import type { Mode } from './types';

// Stub out AuthenticationForm so this suite only tests the Auth page shell:
// heading/subtitle wiring, mode state, and the footer text.
vi.mock('./components/AuthenticationForm', () => ({
  AuthenticationForm: ({
    mode,
    onModeChange,
  }: {
    mode: Mode;
    onModeChange: (m: Mode) => void;
  }) => (
    <div>
      <span data-testid="current-mode">{mode}</span>
      <button onClick={() => onModeChange('signup')}>Switch to signup</button>
      <button onClick={() => onModeChange('login')}>Switch to login</button>
    </div>
  ),
}));

describe('Auth page', () => {
  describe('default (login) mode', () => {
    it('renders "Welcome Back" as the heading', () => {
      render(<Auth />);
      expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    });

    it('renders "Sign in to your wallet" as the subtitle', () => {
      render(<Auth />);
      expect(screen.getByText('Sign in to your wallet')).toBeInTheDocument();
    });

    it('passes "login" as the initial mode to AuthenticationForm', () => {
      render(<Auth />);
      expect(screen.getByTestId('current-mode').textContent).toBe('login');
    });
  });

  describe('switching to signup mode', () => {
    it('updates the heading to "Create Account"', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: 'Switch to signup' }));
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('updates the subtitle to "Set up your new wallet"', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: 'Switch to signup' }));
      expect(screen.getByText('Set up your new wallet')).toBeInTheDocument();
    });

    it('passes "signup" to AuthenticationForm after mode change', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: 'Switch to signup' }));
      expect(screen.getByTestId('current-mode').textContent).toBe('signup');
    });
  });

  describe('switching back to login mode', () => {
    it('reverts the heading to "Welcome Back"', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: 'Switch to signup' }));
      fireEvent.click(screen.getByRole('button', { name: 'Switch to login' }));
      expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    });

    it('reverts the subtitle to "Sign in to your wallet"', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: 'Switch to signup' }));
      fireEvent.click(screen.getByRole('button', { name: 'Switch to login' }));
      expect(screen.getByText('Sign in to your wallet')).toBeInTheDocument();
    });
  });

  describe('static elements', () => {
    it('renders the "Secure Encrypted Connection" footer text', () => {
      render(<Auth />);
      expect(screen.getByText(/Secure Encrypted Connection/i)).toBeInTheDocument();
    });
  });
});
