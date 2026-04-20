import { useRef, useCallback, ReactNode } from 'react';

interface CardLevitateProps {
  children: ReactNode;
}

/**
 * Two-layer card levitation effect:
 *
 *  Outer wrapper (.card-levitate-wrapper)
 *    – JS applies perspective tilt + Y elevation via inline transform
 *    – filter (drop-shadow depth) is CSS-transitioned on hover
 *
 *  Inner div (.card-levitate-inner)
 *    – Runs the "levitate" keyframe animation continuously
 *    – Completely independent from the outer transform so they compose
 *
 * Result: the card bobs gently at all times, and when you hover near an
 * edge it tilts toward you (3-D feel) while staying elevated.
 */
export function CardLevitate({ children }: CardLevitateProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  // Current interpolated tilt
  const cur = useRef({ x: 0, y: 0, elev: 0 });
  // Target tilt (updated on mousemove)
  const tgt = useRef({ x: 0, y: 0, elev: 0 });
  const hovering = useRef(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const applyTransform = () => {
    if (!outerRef.current) return;
    const { x, y, elev } = cur.current;
    outerRef.current.style.transform = `
      perspective(800px)
      rotateX(${x}deg)
      rotateY(${y}deg)
      translateY(${elev}px)
      scale(${hovering.current ? 1.03 : 1})
    `;
  };

  const loop = useCallback(() => {
    const speed = hovering.current ? 0.1 : 0.07;
    cur.current.x = lerp(cur.current.x, tgt.current.x, speed);
    cur.current.y = lerp(cur.current.y, tgt.current.y, speed);
    cur.current.elev = lerp(cur.current.elev, tgt.current.elev, speed);

    applyTransform();

    const stillMoving =
      Math.abs(cur.current.x - tgt.current.x) > 0.02 ||
      Math.abs(cur.current.y - tgt.current.y) > 0.02 ||
      Math.abs(cur.current.elev - tgt.current.elev) > 0.1;

    if (stillMoving || hovering.current) {
      animRef.current = requestAnimationFrame(loop);
    } else {
      animRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (animRef.current === null) {
      animRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const handleMouseEnter = useCallback(() => {
    hovering.current = true;
    tgt.current.elev = -18;
    startLoop();
  }, [startLoop]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = outerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Normalise to [-0.5, 0.5]
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      // Max tilt ±12 on X-axis, ±18 on Y-axis
      tgt.current.x = -ny * 14;
      tgt.current.y = nx * 22;

      startLoop();
    },
    [startLoop],
  );

  const handleMouseLeave = useCallback(() => {
    hovering.current = false;
    tgt.current = { x: 0, y: 0, elev: 0 };
    startLoop();
  }, [startLoop]);

  return (
    <div
      ref={outerRef}
      className="card-levitate-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inner element runs the continuous float animation independently */}
      <div className="card-levitate-inner">{children}</div>
    </div>
  );
}
