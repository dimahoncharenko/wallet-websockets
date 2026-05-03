import { useMemo } from 'react';

interface Spark {
  id: number;
  top: string;
  left: string;
  fontSize: string;
  color: string;
  delay: string;
  duration: string;
  type: 'float' | 'drift';
  opacity: number;
}

const COLORS = [
  'rgba(253, 224, 71, 0.9)',
  'rgba(252, 211, 77, 0.85)',
  'rgba(196, 181, 253, 0.9)',
  'rgba(103, 232, 249, 0.8)',
  'rgba(110, 231, 183, 0.8)',
  'rgba(255, 255, 255, 0.95)',
];

export const Sparkles = ({ count = 14 }: { count?: number }) => {
  const sparks: Spark[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Distribute sparkles around the card edges and just outside
      const edge = Math.random();
      let top: string, left: string;

      if (edge < 0.25) {
        // Top edge
        top = `${-5 + Math.random() * 15}%`;
        left = `${5 + Math.random() * 90}%`;
      } else if (edge < 0.5) {
        // Bottom edge
        top = `${85 + Math.random() * 15}%`;
        left = `${5 + Math.random() * 90}%`;
      } else if (edge < 0.75) {
        // Left edge
        top = `${10 + Math.random() * 80}%`;
        left = `${-5 + Math.random() * 15}%`;
      } else {
        // Right edge
        top = `${10 + Math.random() * 80}%`;
        left = `${85 + Math.random() * 15}%`;
      }

      return {
        id: i,
        top,
        left,
        fontSize: `${8 + Math.random() * 10}px`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: `${Math.random() * 4}s`,
        duration: `${1.8 + Math.random() * 2.2}s`,
        type: Math.random() > 0.4 ? 'float' : 'drift',
        opacity: 0.6 + Math.random() * 0.4,
      };
    });
  }, [count]);

  return (
    <>
      {sparks.map((s) => (
        <span
          key={s.id}
          className={`sparkle sparkle--${s.type}`}
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.fontSize,
            color: s.color,
            opacity: s.opacity,
            ['--delay' as string]: s.delay,
            ['--duration' as string]: s.duration,
            textShadow: `0 0 6px ${s.color}, 0 0 12px ${s.color}`,
            zIndex: 10,
          }}
        />
      ))}
    </>
  );
};
