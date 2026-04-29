import { useEffect, useState } from 'react';
import { CardData, StatData, WebsocketMessage } from 'types';
import { useWebsocket } from '@hooks/useWebsocket';

function Sparkline({ data, color, width = 100, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

interface StatsProps {
  currentCard: CardData;
  onStatsUpdate?: (income: StatData, spending: StatData) => void;
}

export const Stats = ({ currentCard, onStatsUpdate }: StatsProps) => {
  const { socket } = useWebsocket();
  const [income, setIncome] = useState<StatData>({ value: 0, sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
  const [spending, setSpending] = useState<StatData>({ value: 0, sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const message: WebsocketMessage = JSON.parse(event.data);
      if (message.event === 'update-stats' && message.pan === currentCard.pan) {
        setIncome(message.income);
        setSpending(message.spending);
        onStatsUpdate?.(message.income, message.spending);
      }
    };
    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, currentCard.pan]);

  const savings = Math.max(income.value - spending.value, 0);
  const savingsSpk = income.sparkline.map((v, i) => Math.max(v - (spending.sparkline[i] ?? 0), 0));

  const statsList = [
    {
      label: 'Total Income',
      value: `$${income.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: income.value > 0 ? '+12%' : '0%',
      positive: true,
      color: '#30e8a0',
      bgColor: 'rgba(48,232,160,0.12)',
      sparkline: income.sparkline.length > 1 ? income.sparkline : [40, 55, 48, 70, 62, 80, 75, 90, 85, 100],
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30e8a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    },
    {
      label: 'Total Spending',
      value: `$${spending.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: spending.value > 0 ? '-4%' : '0%',
      positive: false,
      color: '#ff6b8a',
      bgColor: 'rgba(255,107,138,0.12)',
      sparkline: spending.sparkline.length > 1 ? spending.sparkline : [80, 70, 85, 60, 75, 55, 65, 50, 60, 45],
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      label: 'Savings',
      value: `$${savings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: '+6%',
      positive: true,
      color: '#a78bfa',
      bgColor: 'rgba(167,139,250,0.12)',
      sparkline: savingsSpk.length > 1 ? savingsSpk : [20, 25, 22, 30, 28, 35, 33, 40, 38, 45],
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#a78bfa">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {statsList.map(({ label, value, change, positive, color, bgColor, sparkline, icon }) => (
        <div
          key={label}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '18px 20px 14px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700,
              color: positive ? '#30e8a0' : '#ff6b8a',
              background: positive ? 'rgba(48,232,160,0.12)' : 'rgba(255,107,138,0.12)',
              padding: '3px 9px', borderRadius: 8,
            }}>
              {change}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{label}</div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.65 }}>
            <Sparkline data={sparkline} color={color} width={100} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
};
