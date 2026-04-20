import { useState, useEffect } from 'react';

export function useAnimatedBalance(value: number, duration = 800) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    let startValue = 0;
    setDisplayValue((prev) => {
      startValue = prev;
      return prev;
    });

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(startValue + (value - startValue) * easing);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return displayValue;
}
