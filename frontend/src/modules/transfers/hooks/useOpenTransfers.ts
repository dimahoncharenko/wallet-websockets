import { useEffect, useState } from 'react';

type Props = {
  isOpen: boolean;
  setAmount: (value: string) => void;
  setPan: (value: string) => void;
  onClose: () => void;
};

export const useOpenTransfers = ({
  isOpen,
  setAmount,
  setPan,
  onClose,
}: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
      setTimeout(() => {
        setPan('');
        setAmount('');
      }, 300);
    }
  }, [isOpen, setAmount, setPan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return {
    mounted,
  };
};
