import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationGroups } from './NotificationGroup';
import type { AppNotification } from 'types';

vi.mock('../helpers', () => ({
  formatTime: () => '10:00 AM',
}));

vi.mock('@components/Icons', () => ({
  SvgClose: () => <svg data-testid="close-icon" />,
}));

vi.mock('@lib/theme', () => ({
  colors: { textPrimary: '#ffffff' },
}));

const makeNotif = (
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id: '1',
  type: 'signin',
  title: 'Sign-in detected',
  description: 'Your account was accessed.',
  timestamp: '2024-06-15T10:00:00',
  interacted: false,
  ...overrides,
});

const makeGroup = (label: string, items: AppNotification[]) => ({
  label,
  items,
});

describe('NotificationGroups', () => {
  describe('group labels', () => {
    it('renders the group label', () => {
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif()])]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('TODAY')).toBeInTheDocument();
    });

    it('renders multiple group labels', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [makeNotif({ id: '1' })]),
            makeGroup('YESTERDAY', [makeNotif({ id: '2' })]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('TODAY')).toBeInTheDocument();
      expect(screen.getByText('YESTERDAY')).toBeInTheDocument();
    });

    it('renders no group labels when groups is empty', () => {
      const { container } = render(
        <NotificationGroups groups={[]} dismiss={vi.fn()} />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('notification item content', () => {
    it('renders the notification title', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [makeNotif({ title: 'Money received' })]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('Money received')).toBeInTheDocument();
    });

    it('renders the notification description', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [makeNotif({ description: 'You got $50' })]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('You got $50')).toBeInTheDocument();
    });

    it('renders the formatted timestamp returned by formatTime', () => {
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif()])]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    it('renders multiple notifications within one group', () => {
      const items = [
        makeNotif({ id: '1', title: 'Notif A' }),
        makeNotif({ id: '2', title: 'Notif B' }),
        makeNotif({ id: '3', title: 'Notif C' }),
      ];
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', items)]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('Notif A')).toBeInTheDocument();
      expect(screen.getByText('Notif B')).toBeInTheDocument();
      expect(screen.getByText('Notif C')).toBeInTheDocument();
    });
  });

  describe('type icons', () => {
    it('shows the 🔐 icon for signin notifications', () => {
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif({ type: 'signin' })])]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('🔐')).toBeInTheDocument();
    });

    it('shows the 💸 icon for money_received notifications', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [
              makeNotif({ id: '1', type: 'money_received' }),
            ]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('💸')).toBeInTheDocument();
    });

    it('shows the 📤 icon for money_sent notifications', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [makeNotif({ id: '1', type: 'money_sent' })]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('📤')).toBeInTheDocument();
    });

    it('shows the 🛡️ icon for security notifications', () => {
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [makeNotif({ id: '1', type: 'security' })]),
          ]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('🛡️')).toBeInTheDocument();
    });

    it('renders all four icons when all types are present', () => {
      const items = [
        makeNotif({ id: '1', type: 'signin' }),
        makeNotif({ id: '2', type: 'money_received' }),
        makeNotif({ id: '3', type: 'money_sent' }),
        makeNotif({ id: '4', type: 'security' }),
      ];
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', items)]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getByText('🔐')).toBeInTheDocument();
      expect(screen.getByText('💸')).toBeInTheDocument();
      expect(screen.getByText('📤')).toBeInTheDocument();
      expect(screen.getByText('🛡️')).toBeInTheDocument();
    });
  });

  describe('dismiss button', () => {
    it('renders one Dismiss button per notification', () => {
      const items = [
        makeNotif({ id: '1' }),
        makeNotif({ id: '2' }),
        makeNotif({ id: '3' }),
      ];
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', items)]}
          dismiss={vi.fn()}
        />,
      );
      expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(
        3,
      );
    });

    it('calls dismiss with the notification id on click', () => {
      const dismiss = vi.fn();
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif({ id: 'notif-42' })])]}
          dismiss={dismiss}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(dismiss).toHaveBeenCalledWith('notif-42');
    });

    it('calls dismiss with the correct id for each button independently', () => {
      const dismiss = vi.fn();
      render(
        <NotificationGroups
          groups={[
            makeGroup('TODAY', [
              makeNotif({ id: 'aaa' }),
              makeNotif({ id: 'bbb' }),
            ]),
          ]}
          dismiss={dismiss}
        />,
      );
      const [btnA, btnB] = screen.getAllByRole('button', { name: 'Dismiss' });
      fireEvent.click(btnA);
      expect(dismiss).toHaveBeenCalledWith('aaa');
      fireEvent.click(btnB);
      expect(dismiss).toHaveBeenCalledWith('bbb');
    });

    it('does not call dismiss before a click', () => {
      const dismiss = vi.fn();
      render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif()])]}
          dismiss={dismiss}
        />,
      );
      expect(dismiss).not.toHaveBeenCalled();
    });
  });

  describe('unread indicator', () => {
    it('renders one more element for an unread notification than an interacted one', () => {
      const { container: unread } = render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif({ interacted: false })])]}
          dismiss={vi.fn()}
        />,
      );
      const { container: read } = render(
        <NotificationGroups
          groups={[makeGroup('TODAY', [makeNotif({ interacted: true })])]}
          dismiss={vi.fn()}
        />,
      );
      // The unread dot is an extra conditionally-rendered div.
      expect(unread.querySelectorAll('div').length).toBeGreaterThan(
        read.querySelectorAll('div').length,
      );
    });
  });
});
