import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { useNotificationsModal } from './useNotificationsModal';
import type { Mode as _Mode } from '../../auth/types'; // unused — only here for import-path sanity

const mockSetModal = vi.fn();
const mockUseModal = vi.fn();

vi.mock('@hooks/useModal', () => ({
  useModal: () => mockUseModal(),
}));

// A component that exercises the hook and attaches the ref to a real DOM element.
const Panel = () => {
  const { isOpen, ref } = useNotificationsModal();
  return isOpen
    ? createElement('div', { ref, 'data-testid': 'panel' }, 'Panel content')
    : null;
};

const openModal = () =>
  mockUseModal.mockReturnValue({
    modals: {
      notificationsPanel: true,
      transferModal: false,
      addCardModal: false,
    },
    setModal: mockSetModal,
  });

const closeModal = () =>
  mockUseModal.mockReturnValue({
    modals: {
      notificationsPanel: false,
      transferModal: false,
      addCardModal: false,
    },
    setModal: mockSetModal,
  });

beforeEach(() => {
  vi.useFakeTimers();
  mockSetModal.mockReset();
  closeModal();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useNotificationsModal', () => {
  describe('isOpen', () => {
    it('is false when notificationsPanel is closed', () => {
      render(createElement(Panel));
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('is true when notificationsPanel is open', () => {
      openModal();
      render(createElement(Panel));
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });
  });

  describe('Escape key', () => {
    it('calls setModal to close the panel when Escape is pressed', () => {
      openModal();
      render(createElement(Panel));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockSetModal).toHaveBeenCalledWith('notificationsPanel', false);
    });

    it('does not call setModal when a non-Escape key is pressed', () => {
      openModal();
      render(createElement(Panel));
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(mockSetModal).not.toHaveBeenCalled();
    });

    it('does not respond to Escape when the panel is closed', () => {
      closeModal();
      render(createElement(Panel));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockSetModal).not.toHaveBeenCalled();
    });

    it('calls setModal only once per Escape press', () => {
      openModal();
      render(createElement(Panel));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockSetModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('click outside', () => {
    it('calls setModal to close when clicking outside the panel', () => {
      openModal();
      render(createElement(Panel));
      act(() => {
        vi.runAllTimers();
      }); // flush the deferred setTimeout

      const outside = document.createElement('div');
      document.body.appendChild(outside);
      fireEvent.mouseDown(outside);

      expect(mockSetModal).toHaveBeenCalledWith('notificationsPanel', false);
      document.body.removeChild(outside);
    });

    it('does not close when clicking inside the panel element', () => {
      openModal();
      render(createElement(Panel));
      act(() => {
        vi.runAllTimers();
      });

      fireEvent.mouseDown(screen.getByTestId('panel'));
      expect(mockSetModal).not.toHaveBeenCalled();
    });

    it('does not fire the outside-click handler before the deferred timeout', () => {
      openModal();
      render(createElement(Panel));
      // intentionally do NOT advance timers

      const outside = document.createElement('div');
      document.body.appendChild(outside);
      fireEvent.mouseDown(outside);

      expect(mockSetModal).not.toHaveBeenCalled();
      document.body.removeChild(outside);
    });
  });

  describe('cleanup on unmount', () => {
    it('removes the keydown listener so Escape no longer fires', () => {
      openModal();
      const { unmount } = render(createElement(Panel));
      unmount();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockSetModal).not.toHaveBeenCalled();
    });

    it('removes the mousedown listener so outside-click no longer fires', () => {
      openModal();
      const { unmount } = render(createElement(Panel));
      act(() => {
        vi.runAllTimers();
      });
      unmount();

      const outside = document.createElement('div');
      document.body.appendChild(outside);
      fireEvent.mouseDown(outside);
      expect(mockSetModal).not.toHaveBeenCalled();
      document.body.removeChild(outside);
    });
  });
});
