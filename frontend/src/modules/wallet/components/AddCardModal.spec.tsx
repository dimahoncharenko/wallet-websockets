import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AddCardModal } from './AddCardModal';
import { useAddCardModal, INITIAL } from '../hooks/useAddCardModal';
import { CARD_COLOR_KEYS } from '../const';

const mockSetForm = vi.fn();
const mockHandleNext = vi.fn();
const mockHandleBack = vi.fn();
const mockHandleConfirm = vi.fn();
const mockSetTouched = vi.fn();

vi.mock('../hooks/useAddCardModal', () => ({
  useAddCardModal: vi.fn(),
  INITIAL: {
    pan: '',
    expiry: '',
    cvv: '',
    holderName: '',
    nickname: '',
    cardColor: 'violet',
  },
}));

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: () => true,
}));

const baseHookReturn = {
  dialogRef: { current: null },
  mounted: true,
  step: 1 as const,
  form: { ...INITIAL },
  setForm: mockSetForm,
  touched: new Set<string>(),
  setTouched: mockSetTouched,
  loading: false,
  network: 'visa' as const,
  rawDigits: '',
  step1Valid: false,
  step2Valid: false,
  handleNext: mockHandleNext,
  handleBack: mockHandleBack,
  handleConfirm: mockHandleConfirm,
  isVisible: true,
};

describe('AddCardModal', () => {
  beforeEach(() => {
    vi.mocked(useAddCardModal).mockReturnValue(baseHookReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('has no a11y violations on step 1', async () => {
    const { container } = render(<AddCardModal isOpen onClose={vi.fn()} />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('shows an alert and marks input aria-invalid on bad PAN', () => {
    vi.mocked(useAddCardModal).mockReturnValue({
      ...baseHookReturn,
      touched: new Set(['pan']),
      form: { ...INITIAL, pan: '1234 5678 9012 3456' },
    });
    render(<AddCardModal isOpen onClose={vi.fn()} />);
    expect(screen.getByLabelText('Card Number')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('calls onClose when the close button is activated', () => {
    const onClose = vi.fn();
    render(<AddCardModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when isOpen is false and not mounted', () => {
    vi.mocked(useAddCardModal).mockReturnValue({
      ...baseHookReturn,
      mounted: false,
      isVisible: false,
    });
    const { container } = render(
      <AddCardModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
