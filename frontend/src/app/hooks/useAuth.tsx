import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
  username: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('wallet_username');
  });

  const isAuthenticated = !!username;

  const login = (name: string) => {
    setUsername(name);
    localStorage.setItem('wallet_username', name);
  };

  const logout = () => {
    setUsername(null);
    localStorage.removeItem('wallet_username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
