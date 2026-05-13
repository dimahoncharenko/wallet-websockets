import { render, screen, fireEvent, act } from '@testing-library/react';
import { TransferForm } from './TransferForm';

const FULL_PAN = '1234 5678 9012 3456'; // 19 chars (16 digits + 3 spaces)

const renderForm = (overrides = {}) => {
  const props = {
    onClose: vi.fn(),
    onTransfer: vi.fn(),
    pan: '',
    amount: '',
    setPan: vi.fn(),
    setAmount: vi.fn(),
    ...overrides,
  };
  render(<TransferForm {...props} />);
  return props;
};

const getSubmitButton = () => screen.getByRole('button', { name: 'Send Now' });
const getForm = () => getSubmitButton().closest('form') as HTMLFormElement;

describe('TransferForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('submit button disabled state', () => {
    it('is disabled when pan and amount are both empty', () => {
      renderForm();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('is disabled when pan is shorter than 19 characters', () => {
      renderForm({ pan: '1234 5678', amount: '100' });
      expect(getSubmitButton()).toBeDisabled();
    });

    it('is disabled when amount is empty even with a full PAN', () => {
      renderForm({ pan: FULL_PAN, amount: '' });
      expect(getSubmitButton()).toBeDisabled();
    });

    it('is enabled when pan is exactly 19 chars and amount is non-empty', () => {
      renderForm({ pan: FULL_PAN, amount: '50' });
      expect(getSubmitButton()).not.toBeDisabled();
    });
  });

  describe('PAN input', () => {
    it('formats typed digits into groups of four separated by spaces', () => {
      const setPan = vi.fn();
      renderForm({ setPan });
      fireEvent.change(screen.getByPlaceholderText('0000 0000 0000 0000'), {
        target: { value: '12345678' },
      });
      expect(setPan).toHaveBeenCalledWith('1234 5678');
    });

    it('strips non-numeric characters before formatting', () => {
      const setPan = vi.fn();
      renderForm({ setPan });
      fireEvent.change(screen.getByPlaceholderText('0000 0000 0000 0000'), {
        target: { value: 'abcd1234' },
      });
      expect(setPan).toHaveBeenCalledWith('1234');
    });

    it('strips whitespace before formatting', () => {
      const setPan = vi.fn();
      renderForm({ setPan });
      fireEvent.change(screen.getByPlaceholderText('0000 0000 0000 0000'), {
        target: { value: '1234 5678' },
      });
      expect(setPan).toHaveBeenCalledWith('1234 5678');
    });
  });

  describe('amount input', () => {
    it('calls setAmount with the raw input value when changed', () => {
      const setAmount = vi.fn();
      renderForm({ setAmount });
      fireEvent.change(screen.getByRole('spinbutton'), {
        target: { value: '99.99' },
      });
      expect(setAmount).toHaveBeenCalledWith('99.99');
    });
  });

  describe('cancel button', () => {
    it('calls onClose when clicked', () => {
      const { onClose } = renderForm();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('form submission', () => {
    it('shows a Processing… indicator and disables the button during the 600 ms delay', () => {
      renderForm({ pan: FULL_PAN, amount: '50' });
      fireEvent.submit(getForm());
      expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
    });

    it('calls onTransfer with a stripped PAN and a numeric amount after 600 ms', () => {
      const { onTransfer } = renderForm({ pan: FULL_PAN, amount: '50' });
      fireEvent.submit(getForm());
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(onTransfer).toHaveBeenCalledWith('1234567890123456', 50);
    });

    it('calls onClose after the 600 ms delay', () => {
      const { onClose } = renderForm({ pan: FULL_PAN, amount: '50' });
      fireEvent.submit(getForm());
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('restores the Send Now button after the delay completes', () => {
      renderForm({ pan: FULL_PAN, amount: '50' });
      fireEvent.submit(getForm());
      act(() => {
        vi.advanceTimersByTime(600);
      });
      // isSubmitting resets to false; button label reverts
      expect(screen.getByRole('button', { name: 'Send Now' })).toBeInTheDocument();
    });
  });
});
