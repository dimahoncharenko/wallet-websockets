import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

const mockLogout = vi.fn();
const mockSetModal = vi.fn();
const mockUseAuth = vi.fn();
const mockUseNotifications = vi.fn();
const mockUseModal = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

vi.mock('@hooks/useModal', () => ({
  useModal: () => mockUseModal(),
}));

vi.mock('@components/Icons', () => ({
  SvgLogout: () => <svg data-testid="logout-icon" />,
  SvgSearch: () => <svg data-testid="search-icon" />,
}));

vi.mock('../helpers', () => ({
  getGreetings: () => 'Good Morning',
}));

const defaultAuth = { logout: mockLogout, username: 'Alice' };
const defaultNotifications = { unreadCount: 0 };
const defaultModal = { setModal: mockSetModal };

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue(defaultAuth);
  mockUseNotifications.mockReturnValue(defaultNotifications);
  mockUseModal.mockReturnValue(defaultModal);
});

describe('Header', () => {
  describe('greeting', () => {
    it('renders the greeting text from getGreetings', () => {
      render(<Header />);
      expect(screen.getAllByText('Good Morning').length).toBeGreaterThan(0);
    });
  });

  describe('username', () => {
    it('renders the username when provided', () => {
      render(<Header />);
      expect(screen.getAllByText(/Alice/).length).toBeGreaterThan(0);
    });

    it('shows "Guest" when username is an empty string', () => {
      mockUseAuth.mockReturnValue({ ...defaultAuth, username: '' });
      render(<Header />);
      expect(screen.getAllByText(/Guest/).length).toBeGreaterThan(0);
    });

    it('shows "Guest" when username is null', () => {
      mockUseAuth.mockReturnValue({ ...defaultAuth, username: null });
      render(<Header />);
      expect(screen.getAllByText(/Guest/).length).toBeGreaterThan(0);
    });
  });

  describe('notifications button', () => {
    it('calls setModal with "notificationsPanel" and true when clicked', () => {
      render(<Header />);
      const buttons = screen.getAllByRole('button', { name: 'Notifications' });
      fireEvent.click(buttons[0]);
      expect(mockSetModal).toHaveBeenCalledWith('notificationsPanel', true);
    });
  });

  describe('unread badge', () => {
    it('does not render a badge when unreadCount is 0', () => {
      mockUseNotifications.mockReturnValue({ unreadCount: 0 });
      render(<Header />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('renders the unread count when unreadCount is positive', () => {
      mockUseNotifications.mockReturnValue({ unreadCount: 5 });
      render(<Header />);
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    });

    it('shows "99+" when unreadCount exceeds 99', () => {
      mockUseNotifications.mockReturnValue({ unreadCount: 100 });
      render(<Header />);
      expect(screen.getAllByText('99+').length).toBeGreaterThan(0);
    });

    it('shows exact count for unreadCount of 99', () => {
      mockUseNotifications.mockReturnValue({ unreadCount: 99 });
      render(<Header />);
      expect(screen.getAllByText('99').length).toBeGreaterThan(0);
    });
  });

  describe('logout button', () => {
    it('calls logout when any logout button is clicked', () => {
      render(<Header />);
      const buttons = screen.getAllByRole('button', { name: 'Logout' });
      fireEvent.click(buttons[0]);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('does not call logout before a click', () => {
      render(<Header />);
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
