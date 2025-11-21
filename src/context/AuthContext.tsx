import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const USERS_KEY = 'users_db_v1';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (usuario: string, clave: string) => Promise<boolean>;
  register: (usuario: string, clave: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const login = async (usuario: string, clave: string) => {
    const { value } = await Preferences.get({ key: USERS_KEY });
    const users = value ? JSON.parse(value) : [];
    const userFound = users.find((u: any) => u.username === usuario && u.password === clave);

    if (userFound) {
      setIsLoggedIn(true);
      setUsername(usuario);
      return true;
    }
    return false;
  };

  const register = async (usuario: string, clave: string) => {
    const { value } = await Preferences.get({ key: USERS_KEY });
    const users = value ? JSON.parse(value) : [];
    const exists = users.find((u: any) => u.username === usuario);

    if (exists) {
      return false;
    }

    const newUser = { username: usuario, password: clave };
    const updatedUsers = [...users, newUser];

    await Preferences.set({
      key: USERS_KEY,
      value: JSON.stringify(updatedUsers),
    });

    setIsLoggedIn(true);
    setUsername(usuario);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
  };

  useEffect(() => {
    const initUsers = async () => {
      const { value } = await Preferences.get({ key: USERS_KEY });
      if (!value) {
        const defaultUser = [{ username: 'admin', password: '123' }];
        await Preferences.set({ key: USERS_KEY, value: JSON.stringify(defaultUser) });
      }
    };
    initUsers();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
