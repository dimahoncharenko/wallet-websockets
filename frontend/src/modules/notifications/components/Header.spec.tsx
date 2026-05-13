import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

// colors is used only for CSS values — mock to avoid theme resolution issues.
vi.mock('@lib/theme', () => ({
  colors: { textPrimary: '#ffffff' },
}));

describe('Header', () => {
  it('always renders the "Notifications" title', () => {
    render(<Header unreadCount={0} markAllRead={vi.fn()} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  describe('when unreadCount is 0', () => {
    it('does not render a count badge', () => {
      render(<Header unreadCount={0} markAllRead={vi.fn()} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('does not render the "Mark all read" button', () => {
      render(<Header unreadCount={0} markAllRead={vi.fn()} />);
      expect(
        screen.queryByRole('button', { name: /mark all read/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when unreadCount > 0', () => {
    it('renders the unread count badge', () => {
      render(<Header unreadCount={5} markAllRead={vi.fn()} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders the "Mark all read" button', () => {
      render(<Header unreadCount={1} markAllRead={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: /mark all read/i }),
      ).toBeInTheDocument();
    });

    it('calls markAllRead when the button is clicked', () => {
      const markAllRead = vi.fn();
      render(<Header unreadCount={3} markAllRead={markAllRead} />);
      fireEvent.click(screen.getByRole('button', { name: /mark all read/i }));
      expect(markAllRead).toHaveBeenCalledTimes(1);
    });

    it('does not call markAllRead without a click', () => {
      const markAllRead = vi.fn();
      render(<Header unreadCount={3} markAllRead={markAllRead} />);
      expect(markAllRead).not.toHaveBeenCalled();
    });
  });

  describe('reactive badge', () => {
    it('updates the badge when count increases', () => {
      const { rerender } = render(
        <Header unreadCount={1} markAllRead={vi.fn()} />,
      );
      expect(screen.getByText('1')).toBeInTheDocument();
      rerender(<Header unreadCount={4} markAllRead={vi.fn()} />);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('hides the badge and button when count drops to 0', () => {
      const { rerender } = render(
        <Header unreadCount={2} markAllRead={vi.fn()} />,
      );
      rerender(<Header unreadCount={0} markAllRead={vi.fn()} />);
      expect(
        screen.queryByRole('button', { name: /mark all read/i }),
      ).not.toBeInTheDocument();
    });
  });
});
