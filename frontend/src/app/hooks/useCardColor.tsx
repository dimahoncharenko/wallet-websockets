import { createContext, useContext, useState } from 'react';
import { CardColor } from 'types';

type Context = {
  cardColor: CardColor;
  changeCardColor: (color: CardColor) => void;
};

const context = createContext<Context | undefined>(undefined);

export const CardColorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cardColor, setCardColor] = useState<CardColor>(
    (localStorage.getItem('card-color') as CardColor) || 'violet',
  );

  const changeCardColor = (color: CardColor) => {
    setCardColor(color);
    localStorage.setItem('card-color', color);
  };

  return (
    <context.Provider value={{ cardColor, changeCardColor }}>
      {children}
    </context.Provider>
  );
};

export const useCardColor = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error('useCardColor must be used within a CardColorProvider');
  }
  
  return contextValue;
};
