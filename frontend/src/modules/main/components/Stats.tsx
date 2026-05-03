import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
} from '@lib/theme';
import { JSX } from 'react';
import { StatData } from 'types';
import { percentageChange } from '../helpers';

type StatItem = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
  bgColor: string;
  sparkline: number[];
  icon: JSX.Element;
};

interface StatsProps {
  income: StatData;
  spending: StatData;
}

export const Stats = ({ income, spending }: StatsProps) => {
  const savings = Math.max(income.value - spending.value, 0);
  const savingsSpk = income.sparkline.map((v, i) =>
    Math.max(v - (spending.sparkline[i] ?? 0), 0),
  );

  const statsList: StatItem[] = [
    {
      label: 'Total Income',
      value: `$${income.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: percentageChange(income.sparkline),
      positive: true,
      color: colors.income,
      bgColor: colors.incomeBg,
      sparkline: income.sparkline,
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.income}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    },
    {
      label: 'Total Spending',
      value: `$${spending.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: percentageChange(spending.sparkline),
      positive: false,
      color: colors.spending,
      bgColor: colors.spendingBg,
      sparkline: spending.sparkline,
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.spending}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      label: 'Savings',
      value: `$${savings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: percentageChange(savingsSpk),
      positive: true,
      color: colors.savings,
      bgColor: colors.savingsBg,
      sparkline: savingsSpk,
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={colors.savings}>
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <StatsList list={statsList} />
    </div>
  );
};

const StatsList = ({ list }: { list: StatItem[] }) => {
  return list.map(
    ({ label, value, change, positive, color, bgColor, sparkline, icon }) => (
      <div
        key={label}
        style={{
          background: colors.surfaceFaint,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: radius['2xl'],
          padding: '18px 20px 14px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              background: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
          <div
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
              color: positive ? colors.income : colors.spending,
              background: positive ? colors.incomeBg : colors.spendingBg,
              padding: '3px 9px',
              borderRadius: radius.sm,
            }}
          >
            {change}
          </div>
        </div>
        <div
          style={{
            fontSize: fontSize['3xl'],
            fontWeight: fontWeight.extrabold,
            color: colors.textPrimary,
            letterSpacing: letterSpacing.tighter,
            marginBottom: 4,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: letterSpacing.normal,
            marginBottom: 12,
          }}
        >
          {label}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            opacity: 0.65,
          }}
        >
          <Sparkline data={sparkline} color={color} width={100} height={36} />
        </div>
      </div>
    ),
  );
};

const Sparkline = ({
  data,
  color,
  width = 100,
  height = 36,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`,
    )
    .join(' ');
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};
