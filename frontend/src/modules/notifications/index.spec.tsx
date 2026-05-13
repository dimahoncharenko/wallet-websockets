import { render, screen } from '@testing-library/react';
import { NotificationsPanel } from './index';
import type { AppNotification } from 'types';

const mockUseNotifications = vi.fn();
const mockUseNotificationsModal = vi.fn();
const mockUseMediaQuery = vi.fn();

vi.mock('@hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

vi.mock('./hooks/useNotificationsModal', () => ({
  useNotificationsModal: () => mockUseNotificationsModal(),
}));

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}));

// Stub child components so this suite focuses on panel-level behaviour.
vi.mock('./components/Header', () => ({
  Header: ({
    unreadCount,
    markAllRead,
  }: {
    unreadCount: number;
    markAllRead: () => void;
  }) => (
    <div data-testid="header" data-unread={unreadCount}>
      <button onClick={markAllRead}>Mark all read</button>
    </div>
  ),
}));

vi.mock('./components/NotificationGroup', () => ({
  NotificationGroups: ({
    groups,
  }: {
    groups: { label: string; items: AppNotification[] }[];
  }) => (
    <div data-testid="groups">
      {groups.flatMap(({ items }) =>
        items.map((n) => (
          <div key={n.id} data-testid={`notif-${n.id}`}>
            {n.title}
          </div>
        )),
      )}
    </div>
  ),
}));

vi.mock('./components/Empty', () => ({
  Empty: () => <div data-testid="empty">No notifications yet</div>,
}));

// groupByDate passes through for simplicity — tests control what notifications array
// is returned, and the stub NotificationGroups renders them directly.
vi.mock('./helpers', () => ({
  groupByDate: (items: AppNotification[]) =>
    items.length ? [{ label: 'TODAY', items }] : [],
}));

const makeNotif = (id: string): AppNotification => ({
  id,
  type: 'signin',
  title: `Notification ${id}`,
  description: `Desc ${id}`,
  timestamp: '2024-06-15T10:00:00',
  interacted: false,
});

const defaultNotifications = {
  notifications: [],
  unreadCount: 0,
  markAllRead: vi.fn(),
  dismiss: vi.fn(),
};

const openPanel = { isOpen: true, ref: { current: null } };
const closedPanel = { isOpen: false, ref: { current: null } };

describe('NotificationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNotifications.mockReturnValue(defaultNotifications);
    mockUseNotificationsModal.mockReturnValue(openPanel);
    mockUseMediaQuery.mockReturnValue(true); // desktop
  });

  describe('visibility', () => {
    it('returns null when the panel is closed', () => {
      mockUseNotificationsModal.mockReturnValue(closedPanel);
      const { container } = render(<NotificationsPanel />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders the panel when it is open', () => {
      render(<NotificationsPanel />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows the Empty component when there are no notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        notifications: [],
      });
      render(<NotificationsPanel />);
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });

    it('hides the Empty component when notifications exist', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        notifications: [makeNotif('1')],
      });
      render(<NotificationsPanel />);
      expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
    });
  });

  describe('notifications list', () => {
    it('shows NotificationGroups when notifications exist', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        notifications: [makeNotif('1')],
      });
      render(<NotificationsPanel />);
      expect(screen.getByTestId('groups')).toBeInTheDocument();
    });

    it('renders one entry per notification', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        notifications: [makeNotif('a'), makeNotif('b'), makeNotif('c')],
      });
      render(<NotificationsPanel />);
      expect(screen.getByTestId('notif-a')).toBeInTheDocument();
      expect(screen.getByTestId('notif-b')).toBeInTheDocument();
      expect(screen.getByTestId('notif-c')).toBeInTheDocument();
    });
  });

  describe('header props', () => {
    it('passes unreadCount to Header', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        unreadCount: 7,
      });
      render(<NotificationsPanel />);
      expect(screen.getByTestId('header')).toHaveAttribute('data-unread', '7');
    });

    it('passes markAllRead to Header and calls it when triggered', () => {
      const markAllRead = vi.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultNotifications,
        markAllRead,
      });
      render(<NotificationsPanel />);
      screen.getByRole('button', { name: 'Mark all read' }).click();
      expect(markAllRead).toHaveBeenCalledTimes(1);
    });
  });

  describe('responsive positioning', () => {
    it('uses top: 64px on desktop', () => {
      mockUseMediaQuery.mockReturnValue(true);
      const { container } = render(<NotificationsPanel />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.style.top).toBe('64px');
    });

    it('uses top: 92px on mobile', () => {
      mockUseMediaQuery.mockReturnValue(false);
      const { container } = render(<NotificationsPanel />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.style.top).toBe('92px');
    });
  });
});
