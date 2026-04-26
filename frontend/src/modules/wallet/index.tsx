import { useState, useRef, useEffect } from 'react';
import { WalletProps } from 'types';
import './wallet.css';
import { WalletCard } from './components/WalletCard';
import { CardLevitate } from './components/CardLevitate';
import { Sparkles } from './components/Sparkles';

export default function Wallet({
  cards,
  activeIndex: controlledIndex,
  onActiveIndexChange,
}: WalletProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
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
        <div className="bg-white/5 ml-auto max-w-24 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase lg:hidden text-white/60">
          Card {activeIndex + 1} of {cards.length}
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing pb-28 pt-12"
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 snap-center px-4 relative"
          >
            <div className="relative">
              <CardLevitate>
                <Sparkles count={i === activeIndex ? 12 : 0} />
                <WalletCard card={card} />
              </CardLevitate>
              <div
                className="card-glow"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {cards.length > 1 && (
        <div className="flex justify-center items-center gap-2 -mt-16 relative z-10 lg:justify-between lg:px-1">
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`
                  h-1.5 rounded-full transition-all duration-500 ease-out
                  ${
                    i === activeIndex
                      ? 'bg-gradient-to-r from-violet-400 to-indigo-500 w-8 opacity-100 shadow-[0_0_8px_rgba(167,139,250,0.5)]'
                      : 'bg-white/20 w-1.5 hover:bg-white/40 opacity-50'
                  }
                `}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>
          <button className="hidden lg:flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors font-medium">
            <span className="text-base leading-none">+</span> Add card
          </button>
        </div>
      )}
    </div>
  );
}
