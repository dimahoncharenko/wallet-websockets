import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { StatData } from 'types';

export type RootActions = {
  updateBalance: (pan: string, delta: number) => void;
  sendAddCard: () => void;
  setSpending: Dispatch<SetStateAction<StatData>>;
  setIncome: Dispatch<SetStateAction<StatData>>;
  setActiveNav: Dispatch<SetStateAction<string>>;
};

type Context = RootActions & {
  setRootActions: (actions: Omit<RootActions, 'setRootActions'>) => void;
};

const context = createContext<Context | undefined>(undefined);

export const useRootActions = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error(
      'useRootActions should be used withing RootActionsProvider',
    );
  }
  return contextValue;
};

export const RootActionsProvider = ({ children }: { children: ReactNode }) => {
  const [rootActions, setRootActions] = useState<RootActions>({
    updateBalance: () => {
      return;
    },
    sendAddCard: () => {
      return;
    },
    setSpending: () => {
      return;
    },
    setIncome: () => {
      return;
    },
    setActiveNav: () => {
      return;
    },
  });

  return (
    <context.Provider value={{ ...rootActions, setRootActions }}>
      {children}
    </context.Provider>
  );
};
