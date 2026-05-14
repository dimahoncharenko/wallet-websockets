import { render, screen } from '@testing-library/react';
import { BudgetBar } from './BudgetBar';

vi.mock('@lib/theme', () => ({
  colors: {
    surfaceBare: '#0a0a10',
    borderSubtle: '#222233',
    textPrimary: '#ffffff',
    textMuted: '#888888',
    textSubtle: '#666666',
  },
  fontSize: { lg: '18px', base: '14px', md: '13px' },
  fontWeight: { bold: '700', regular: '400', medium: '500' },
  radius: { '2xl': '16px' },
  transition: { slow: '0.5s' },
}));

describe('BudgetBar', () => {
  // ─── header ───────────────────────────────────────────────────────────────

  it('always renders "Monthly Budget" label', () => {
    render(<BudgetBar income={5000} spending={2500} dot="#ff0000" />);
    expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
  });

  describe('amounts', () => {
    it('renders the spending amount with $ prefix', () => {
      render(<BudgetBar income={5000} spending={2500} dot="#ff0000" />);
      expect(screen.getByText('$2,500')).toBeInTheDocument();
    });

    it('renders the budget amount when income is positive', () => {
      render(<BudgetBar income={5000} spending={2500} dot="#ff0000" />);
      expect(screen.getByText(/\/\s*\$5,000/)).toBeInTheDocument();
    });

    it('renders the fallback budget of $5,000 when income is 0', () => {
      render(<BudgetBar income={0} spending={1000} dot="#ff0000" />);
      expect(screen.getByText(/\/\s*\$5,000/)).toBeInTheDocument();
    });

    it('renders $0 for spending when there is no spending', () => {
      render(<BudgetBar income={3000} spending={0} dot="#ff0000" />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('percentage used', () => {
    it('renders the correct "% used this month" text', () => {
      render(<BudgetBar income={5000} spending={2500} dot="#ff0000" />);
      expect(screen.getByText('50% used this month')).toBeInTheDocument();
    });

    it('renders 0% used when spending is zero', () => {
      render(<BudgetBar income={5000} spending={0} dot="#ff0000" />);
      expect(screen.getByText('0% used this month')).toBeInTheDocument();
    });

    it('renders 100% used when spending exceeds budget', () => {
      render(<BudgetBar income={1000} spending={2000} dot="#ff0000" />);
      expect(screen.getByText('100% used this month')).toBeInTheDocument();
    });

    it('renders 100% used when spending exactly equals budget', () => {
      render(<BudgetBar income={1000} spending={1000} dot="#ff0000" />);
      expect(screen.getByText('100% used this month')).toBeInTheDocument();
    });
  });

  describe('remaining', () => {
    it('renders the remaining amount', () => {
      render(<BudgetBar income={5000} spending={2500} dot="#ff0000" />);
      expect(screen.getByText(/\$2,500\s*remaining/)).toBeInTheDocument();
    });

    it('renders $0 remaining when spending exceeds budget', () => {
      render(<BudgetBar income={1000} spending={2000} dot="#ff0000" />);
      expect(screen.getByText(/\$0\s*remaining/)).toBeInTheDocument();
    });

    it('renders full budget as remaining when spending is zero', () => {
      render(<BudgetBar income={3000} spending={0} dot="#ff0000" />);
      expect(screen.getByText(/\$3,000\s*remaining/)).toBeInTheDocument();
    });
  });
});
