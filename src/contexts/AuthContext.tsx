import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ApiUser,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  loginApi,
  logoutApi,
  meApi,
  registerApi,
  saveAuthTokens,
} from '@/utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'USER' | 'STAFF' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const noopAsync = async () => undefined;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  login: noopAsync,
  register: noopAsync,
  logout: () => undefined,
};

const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name || `${apiUser.first_name} ${apiUser.last_name}`.trim(),
  email: apiUser.email,
  role: apiUser.role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const bootstrapAuth = async () => {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const apiUser = await meApi();
        if (mounted) setUser(mapApiUserToUser(apiUser));
      } catch {
        clearAuthTokens();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await loginApi(email, password);
    saveAuthTokens(payload.access, payload.refresh);
    setUser(mapApiUserToUser(payload.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const payload = await registerApi(name, email, password);
    saveAuthTokens(payload.access, payload.refresh);
    setUser(mapApiUserToUser(payload.user));
  };

  const logout = () => {
    const refresh = getRefreshToken();
    if (refresh) {
      logoutApi(refresh).catch(() => undefined);
    }
    clearAuthTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? fallbackAuthContext;
}
