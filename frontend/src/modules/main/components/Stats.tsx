import { useEffect, useState } from 'react';
import { CardData, StatData, WebsocketMessage } from 'types';
import { useWebsocket } from '@hooks/useWebsocket';

const generateTrendSparkline = (value: number, change: string): string => {
  if (value === 0) {
    return 'M0 30 L45 30';
  }

  const points = 7;
  const width = 45;
  const height = 30;
  const stepX = width / (points - 1);
  const isUp = change.startsWith('+');

  const path: string[] = [];

  let seed = value === 0 ? 12345 : value;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < points; i++) {
    const x = i * stepX;
    const progress = i / (points - 1);

    const baseY = isUp ? 25 - 20 * progress : 5 + 20 * progress;
    const noise = i === 0 || i === points - 1 ? 0 : random() * 12 - 6;

    let y = baseY + noise;
    y = Math.max(0, Math.min(height, y));

    path.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return path.join(' ');
};

interface StatsProps {
  currentCard: CardData;
}

export const Stats = ({ currentCard }: StatsProps) => {
  const { socket } = useWebsocket();
  const [income, setIncome] = useState<StatData>({ value: 0, sparkline: [0] });
  const [spending, setSpending] = useState<StatData>({
    value: 0,
    sparkline: [0],
  });

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: WebsocketMessage = JSON.parse(event.data);
      if (message.event === 'update-stats' && message.pan === currentCard.pan) {
        setIncome(message.income);
        setSpending(message.spending);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, currentCard.pan]);

  const startOfMonthBalance =
    currentCard.balance - income.value + spending.value;

  const getPercentage = (value: number) => {
    if (startOfMonthBalance === 0) return '0%';
    const pct = (value / startOfMonthBalance) * 100;
    return `${pct.toFixed(0)}%`;
  };

  const statsList = [
    {
      label: 'Income',
      value: `$${income.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: income.value > 0 ? `+${getPercentage(income.value)}` : '0%',
      icon: '↑',
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      sparkline: generateTrendSparkline(
        income.value,
        income.value > 0 ? `+${getPercentage(income.value)}` : '0%',
      ),
    },
    {
      label: 'Spending',
      value: `$${spending.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      change: spending.value > 0 ? `-${getPercentage(spending.value)}` : '0%',
      icon: '↓',
      accent: 'text-rose-400',
      bg: 'bg-rose-500/10',
      sparkline: generateTrendSparkline(
        spending.value,
        spending.value > 0 ? `-${getPercentage(spending.value)}` : '0%',
      ),
    },
    {
      label: 'Savings',
      value: '$0',
      change: '+6%',
      icon: '◆',
      accent: 'text-violet-400',
      bg: 'bg-violet-500/10',
      sparkline: generateTrendSparkline(0, '0%'),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {statsList.map(
        ({ label, value, change, icon, accent, bg, sparkline }) => (
          <div
            key={label}
            className="rounded-[24px] bg-white/[0.03] border border-white/[0.05] p-4 flex flex-col shadow-lg shadow-black/20"
          >
            <div
              className={`w-9 h-9 rounded-[12px] ${bg} flex items-center justify-center mb-3`}
            >
              <span className={`text-lg font-bold ${accent}`}>{icon}</span>
            </div>

            <p className="text-[20px] font-black leading-none mb-1.5 tracking-tight">
              {value}
            </p>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-3">
              {label}
            </p>

            <div className="flex items-end justify-between mt-auto -mx-1">
              <div
                className={`px-2 py-0.5 rounded-lg ${bg} ${accent} text-[11px] font-bold`}
              >
                {change}
              </div>
              <div className={`w-12 h-6 ${accent}`}>
                <svg
                  viewBox="0 0 45 30"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sparkline}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
};
