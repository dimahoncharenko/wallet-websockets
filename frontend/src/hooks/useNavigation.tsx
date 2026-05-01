import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type Context = {
  activeNav: string;
  setActiveNav: Dispatch<SetStateAction<string>>;
};

const context = createContext<Context | undefined>(undefined);

export const useNavigation = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return contextValue;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <context.Provider value={{ activeNav, setActiveNav }}>
      {children}
    </context.Provider>
  );
};
