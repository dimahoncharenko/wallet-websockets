import { useState, useRef, useEffect } from 'react';
import { WalletProps } from 'types';
import './wallet.css';
import { WalletCard } from './components/WalletCard';
import { CardLevitate } from './components/CardLevitate';
import { Sparkles } from './components/Sparkles';
import { useWalletCards } from '@hooks/useWalletCards';

export default function Wallet({
  cards,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onAddCard,
}: WalletProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const { cardTheme } = useWalletCards();
  const activeIndex = controlledIndex ?? internalActiveIndex;

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeIndex) {
      if (onActiveIndexChange) {
        onActiveIndexChange(index);
      } else {
        setInternalActiveIndex(index);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollTo(Math.max(0, activeIndex - 1));
      } else if (e.key === 'ArrowRight') {
        scrollTo(Math.min(cards.length - 1, activeIndex + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, cards.length]);

  return (
    <div className="relative w-full">
      {Array.isArray(cards) && cards.length > 1 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="bg-white/5 ml-auto max-w-24 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase lg:hidden text-white/60"
        >
          Card {activeIndex + 1} of {cards.length}
        </div>
      )}
      <div
        ref={scrollRef}
        role="region"
        aria-label="Payment cards"
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing pb-24 pt-10"
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 snap-center px-2 relative"
          >
            <CardLevitate>
              <Sparkles count={i === activeIndex ? 12 : 0} />
              <WalletCard card={card} />
            </CardLevitate>
          </div>
        ))}
      </div>

      {/* Dots + add card */}
      <div className="flex justify-center items-center -mt-12 relative z-10 lg:justify-between lg:px-1">
        <div className="flex items-center">
          {cards.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to card ${i + 1}`}
                style={{
                  padding: '10px 6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: isActive ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: isActive
                      ? cardTheme.dot
                      : 'rgba(255,255,255,0.18)',
                    boxShadow: isActive ? `0 0 10px ${cardTheme.glow}` : 'none',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                />
              </button>
            );
          })}
        </div>
        <button
          onClick={onAddCard}
          className="hidden lg:flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors font-medium"
        >
          <span aria-hidden="true" className="text-base leading-none">+</span> Add card
        </button>
      </div>
    </div>
  );
}
