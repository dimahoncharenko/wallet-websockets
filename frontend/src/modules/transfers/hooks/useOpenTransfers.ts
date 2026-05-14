import { useEffect, useRef, useState } from 'react';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      requestAnimationFrame(() => setMounted(true));
    } else {
      (triggerRef.current as HTMLElement)?.focus();
      triggerRef.current = null;
      setMounted(false);
      setTimeout(() => {
        setPan('');
        setAmount('');
      }, 300);
    }
  }, [isOpen, setAmount, setPan]);

  useEffect(() => {
    if (isOpen && mounted) {
      dialogRef.current?.focus();
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return {
    dialogRef,
    mounted,
  };
};
