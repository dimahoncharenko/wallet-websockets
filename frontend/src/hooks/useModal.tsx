import { useState, createContext, useContext } from 'react';

export type ModalType = 'transferModal';

type ModalContextType = {
  modals: Record<ModalType, boolean>;
  setModal: (type: ModalType, value: boolean) => void;
};

const context = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [modals, setModals] = useState<Record<ModalType, boolean>>({
    transferModal: false,
  });

  const setModal = (type: ModalType, value: boolean) => {
    setModals((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <context.Provider value={{ modals, setModal }}>{children}</context.Provider>
  );
};

export const useModal = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return contextValue;
};
