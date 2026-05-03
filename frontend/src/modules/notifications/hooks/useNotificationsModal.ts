import { useModal } from '@hooks/useModal';
import { useEffect, useRef } from 'react';

export const useNotificationsModal = () => {
  const { modals, setModal } = useModal();
  const panelRef = useRef<HTMLDivElement>(null);
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
    setTimeout(() => document.addEventListener('mousedown', onClickOutside), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen, setModal]);

  return { isOpen, ref: panelRef };
};
