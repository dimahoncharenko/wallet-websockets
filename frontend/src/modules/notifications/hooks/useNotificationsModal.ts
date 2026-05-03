import { useModal } from '@hooks/useModal';
import { useEffect, useRef } from 'react';

export const useNotificationsModal = () => {
  const { modals, setModal } = useModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const deferredTimeoutRef = useRef<number | null>(null);
  const isOpen = modals.notificationsPanel;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal('notificationsPanel', false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setModal('notificationsPanel', false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    deferredTimeoutRef.current = window.setTimeout(
      () => document.addEventListener('mousedown', onClickOutside),
      0,
    );
    return () => {
      if (deferredTimeoutRef.current) {
        window.clearTimeout(deferredTimeoutRef.current);
        deferredTimeoutRef.current = null;
      }

      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, setModal]);

  return { isOpen, ref: panelRef };
};
