import { useEffect, useRef, useState } from 'react';
import { useRootActions, type AddCardData } from '@hooks/useRootActions';
import type { CardColor } from 'types';
import { detectNetwork, luhn, validateExpiry } from '../helpers';

export type FormData = {
  pan: string;
  expiry: string;
  cvv: string;
  holderName: string;
  nickname: string;
  cardColor: CardColor;
};

export const INITIAL: FormData = {
  pan: '',
  expiry: '',
  cvv: '',
  holderName: '',
  nickname: '',
  cardColor: 'violet',
};

export const useAddCardModal = (isOpen: boolean, onClose: () => void) => {
  const { sendAddCard } = useRootActions();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      requestAnimationFrame(() => setMounted(true));
    } else {
      (triggerRef.current as HTMLElement)?.focus();
      triggerRef.current = null;
      setMounted(false);

      const t = setTimeout(() => {
        setForm(INITIAL);
        setStep(1);
        setTouched(new Set());
        setLoading(false);
      }, 300);

      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mounted) {
      dialogRef.current?.focus();
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', onKey);
    }

    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const network = detectNetwork(form.pan);
  const rawDigits = form.pan.replace(/\s/g, '');

  const step1Valid =
    rawDigits.length === 16 &&
    luhn(form.pan) &&
    validateExpiry(form.expiry) &&
    form.cvv.length >= 3;

  const step2Valid = form.holderName.trim().length > 0;

  const handleNext = () => setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  const handleBack = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const handleConfirm = () => {
    setLoading(true);
    const data: AddCardData = {
      pan: rawDigits,
      expiry: form.expiry,
      holderName: form.holderName.toUpperCase(),
      cardNetwork: network,
      cardColor: form.cardColor,
    };
    sendAddCard(data);
    setTimeout(onClose, 700);
  };

  return {
    dialogRef,
    mounted,
    step,
    form,
    setForm,
    touched,
    setTouched,
    loading,
    network,
    rawDigits,
    step1Valid,
    step2Valid,
    handleNext,
    handleBack,
    handleConfirm,
    isVisible: isOpen && mounted,
  };
};
