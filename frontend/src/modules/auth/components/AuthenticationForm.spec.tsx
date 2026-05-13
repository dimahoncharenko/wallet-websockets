import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { AuthenticationForm } from './AuthenticationForm';

const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin, signup: mockSignup }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const defaultProps = {
  mode: 'login' as const,
  onModeChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockLogin.mockResolvedValue({ error: null });
  mockSignup.mockResolvedValue({ error: null });
});

describe('AuthenticationForm', () => {
  describe('tab navigation', () => {
    it('renders Sign In and Sign Up tabs', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'Sign In' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Sign Up' }),
      ).toBeInTheDocument();
    });

    it('calls onModeChange with "login" when Sign In is clicked', () => {
      const onModeChange = vi.fn();
      render(<AuthenticationForm mode="signup" onModeChange={onModeChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      expect(onModeChange).toHaveBeenCalledWith('login');
    });

    it('calls onModeChange with "signup" when Sign Up is clicked', () => {
      const onModeChange = vi.fn();
      render(<AuthenticationForm mode="login" onModeChange={onModeChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      expect(onModeChange).toHaveBeenCalledWith('signup');
    });
  });

  describe('form fields', () => {
    it('renders email and password fields in login mode', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('does not render the display name field in login mode', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(
        screen.queryByPlaceholderText('Display name'),
      ).not.toBeInTheDocument();
    });

    it('renders the display name field in signup mode', () => {
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      expect(screen.getByPlaceholderText('Display name')).toBeInTheDocument();
    });

    it('email input has type email', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
        'type',
        'email',
      );
    });

    it('password input has type password', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
        'type',
        'password',
      );
    });
  });

  describe('submit button label', () => {
    it('shows "Access Wallet" in login mode', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'Access Wallet' }),
      ).toBeInTheDocument();
    });

    it('shows "Create Account" in signup mode', () => {
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Create Account' }),
      ).toBeInTheDocument();
    });
  });

  describe('login flow', () => {
    it('calls login with email and password on submit', async () => {
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'secret123' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret123');
      });
    });

    it('navigates to "/" on successful login', async () => {
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('shows the error message when login fails', async () => {
      mockLogin.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('does not navigate when login returns an error', async () => {
      mockLogin.mockResolvedValue({ error: { message: 'Bad request' } });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('does not call signup in login mode', async () => {
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(mockSignup).not.toHaveBeenCalled();
      });
    });
  });

  describe('signup flow', () => {
    it('calls signup with email, password, and trimmed display name', async () => {
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Display name'), {
        target: { value: '  Alice  ' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'alice@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'pass1234' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(
          'alice@example.com',
          'pass1234',
          'Alice',
        );
      });
    });

    it('navigates to "/" on successful signup', async () => {
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('shows the error message when signup fails', async () => {
      mockSignup.mockResolvedValue({
        error: { message: 'Email already registered' },
      });
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      await waitFor(() => {
        expect(
          screen.getByText('Email already registered'),
        ).toBeInTheDocument();
      });
    });

    it('does not navigate when signup returns an error', async () => {
      mockSignup.mockResolvedValue({ error: { message: 'Weak password' } });
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('does not call login in signup mode', async () => {
      render(<AuthenticationForm mode="signup" onModeChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });

  describe('error clearing', () => {
    it('clears the error when the email input changes', async () => {
      mockLogin.mockResolvedValue({ error: { message: 'Wrong password' } });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => screen.getByText('Wrong password'));

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'new@example.com' },
      });
      expect(screen.queryByText('Wrong password')).not.toBeInTheDocument();
    });

    it('clears the error when the password input changes', async () => {
      mockLogin.mockResolvedValue({ error: { message: 'Wrong password' } });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => screen.getByText('Wrong password'));

      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'newpass' },
      });
      expect(screen.queryByText('Wrong password')).not.toBeInTheDocument();
    });

    it('clears the error when a mode tab is clicked', async () => {
      mockLogin.mockResolvedValue({ error: { message: 'Wrong password' } });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => screen.getByText('Wrong password'));

      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      expect(screen.queryByText('Wrong password')).not.toBeInTheDocument();
    });

    it('does not show error before a failed submit', () => {
      render(<AuthenticationForm {...defaultProps} />);
      expect(
        screen.queryByText(/invalid|error|wrong/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows "..." and disables the button while login is in flight', async () => {
      let resolveLogin!: (v: { error: null }) => void;
      mockLogin.mockReturnValue(new Promise((r) => (resolveLogin = r)));

      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));

      const loadingBtn = await screen.findByRole('button', { name: '...' });
      expect(loadingBtn).toBeDisabled();

      await act(async () => {
        resolveLogin({ error: null });
      });
    });

    it('re-enables the button after login completes', async () => {
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Access Wallet' }),
        ).not.toBeDisabled();
      });
    });

    it('re-enables the button even when login returns an error', async () => {
      mockLogin.mockResolvedValue({ error: { message: 'Bad credentials' } });
      render(<AuthenticationForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Access Wallet' }));
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Access Wallet' }),
        ).not.toBeDisabled();
      });
    });
  });
});
