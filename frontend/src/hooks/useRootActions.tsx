import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { StatData } from 'types';

export type RootActions = Partial<{
  updateBalance: (pan: string, delta: number) => void;
  sendAddCard: () => void;
  setRootActions: (actions: Omit<RootActions, 'setRootActions'>) => void;
  setSpending: Dispatch<SetStateAction<StatData>>;
  setIncome: Dispatch<SetStateAction<StatData>>;
  setActiveNav: Dispatch<SetStateAction<string>>;
}>;

const context = createContext<RootActions | undefined>(undefined);

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
  const [rootActions, setRootActions] = useState<RootActions>({});

  return (
    <context.Provider value={{ ...rootActions, setRootActions }}>
      {children}
    </context.Provider>
  );
};
