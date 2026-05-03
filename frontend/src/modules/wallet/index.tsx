import { WalletProps } from 'types';
import { WalletCard } from './components/WalletCard';
import { CardLevitate } from './components/CardLevitate';
import { Sparkles } from './components/Sparkles';
import { useWalletCards } from '@hooks/useWalletCards';
import { useWalletSlider } from './hooks/useWalletSlider';
import './wallet.css';

export default function Wallet({
  cards,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onAddCard,
}: WalletProps) {
  const { cardTheme } = useWalletCards();
  const { activeIndex, scrollRef, handleScroll, scrollTo } = useWalletSlider({
    cards,
    controlledIndex,
    onActiveIndexChange,
  });

  const renderSliderDots = () => {
    return cards.map((_, i) => {
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
            style={{
              width: isActive ? 22 : 8,
              height: 8,
              borderRadius: 4,
              background: isActive ? cardTheme.dot : 'rgba(255,255,255,0.18)',
              boxShadow: isActive ? `0 0 10px ${cardTheme.glow}` : 'none',
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </button>
      );
    });
  };

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

      <div className="flex justify-center items-center -mt-12 relative z-10 lg:justify-between lg:px-1">
        <div className="flex items-center">{renderSliderDots()}</div>
        <button
          onClick={onAddCard}
          className="hidden lg:flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors font-medium"
        >
          <span className="text-base leading-none">+</span> Add card
        </button>
      </div>
    </div>
  );
}
