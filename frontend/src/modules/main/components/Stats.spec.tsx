import { render, screen } from '@testing-library/react';
import { Stats } from './Stats';
import type { StatData } from 'types';

vi.mock('@lib/theme', () => ({
  colors: {
    income: '#4ade80',
    incomeBg: '#052e16',
    spending: '#f87171',
    spendingBg: '#450a0a',
    savings: '#60a5fa',
    savingsBg: '#0c1a2e',
    textPrimary: '#ffffff',
    textMuted: '#888888',
    surfaceFaint: '#111111',
    borderSubtle: '#222222',
  },
  fontSize: { md: '13px', sm: '11px', '3xl': '24px' },
  fontWeight: { bold: '700', medium: '500', extrabold: '800' },
  letterSpacing: { tighter: '-0.05em', normal: '0em' },
  radius: { md: '6px', sm: '4px', '2xl': '16px' },
}));

vi.mock('@components/Icons', () => ({
  SvgArrowUp: () => <svg data-testid="arrow-up" />,
  SvgArrowDown: () => <svg data-testid="arrow-down" />,
  SvgDiamond: () => <svg data-testid="diamond" />,
}));

vi.mock('../helpers', () => ({
  percentageChange: vi.fn().mockReturnValue('+10%'),
}));

const makeStat = (value: number, sparkline: number[] = []): StatData => ({
  value,
  sparkline,
});

describe('Stats', () => {
  describe('section labels', () => {
    it('renders "Total Income" label', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByText('Total Income')).toBeInTheDocument();
    });

    it('renders "Total Spending" label', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByText('Total Spending')).toBeInTheDocument();
    });

    it('renders "Savings" label', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByText('Savings')).toBeInTheDocument();
    });
  });

  describe('formatted values', () => {
    it('renders the income value formatted with a $ prefix', () => {
      render(<Stats income={makeStat(2000)} spending={makeStat(500)} />);
      expect(screen.getByText('$2,000')).toBeInTheDocument();
    });

    it('renders the spending value formatted with a $ prefix', () => {
      render(<Stats income={makeStat(5000)} spending={makeStat(1500)} />);
      expect(screen.getByText('$1,500')).toBeInTheDocument();
    });

    it('renders zero income as "$0"', () => {
      render(<Stats income={makeStat(0)} spending={makeStat(0)} />);
      expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    });
  });

  describe('savings calculation', () => {
    it('shows savings as income minus spending when income exceeds spending', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(400)} />);
      expect(screen.getByText('$600')).toBeInTheDocument();
    });

    it('shows $0 savings when spending equals income', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(1000)} />);
      expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    });

    it('shows $0 savings when spending exceeds income (floors at zero)', () => {
      render(<Stats income={makeStat(500)} spending={makeStat(1000)} />);
      // Income=$500, Spending=$1,000, Savings=$0 (not negative)
      expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    });
  });

  describe('percentage change', () => {
    it('renders the percentage change badge for each stat card', () => {
      render(
        <Stats
          income={makeStat(1000, [100, 200])}
          spending={makeStat(500, [50, 100])}
        />,
      );
      expect(screen.getAllByText('+10%')).toHaveLength(3);
    });
  });

  describe('icons', () => {
    it('renders the arrow-up icon for income', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    });

    it('renders the arrow-down icon for spending', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
    });

    it('renders the diamond icon for savings', () => {
      render(<Stats income={makeStat(1000)} spending={makeStat(500)} />);
      expect(screen.getByTestId('diamond')).toBeInTheDocument();
    });
  });
});
