import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, clearAuthToken, getAuthToken, setAuthToken, type AuthUser } from '../api/auth';
import { ROUTES } from '../routes/paths';

export type { AuthUser };

interface AuthContextValue {
  user: AuthUser | null;
  authRequired: boolean;
  googleEnabled: boolean;
  passwordEnabled: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const status = await authApi.status();
      setAuthRequired(status.required);
      setGoogleEnabled(status.google);
      setPasswordEnabled(status.password);

      if (!status.required) {
        setUser({ email: 'local', provider: 'none' });
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }

      const me = await authApi.me();
      setUser(me);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const finishLogin = useCallback((token: string, nextUser: AuthUser) => {
    setAuthToken(token);
    setUser(nextUser);
    setAuthRequired(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      finishLogin(res.token, res.user);
    },
    [finishLogin]
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const res = await authApi.loginWithGoogle(credential);
      finishLogin(res.token, res.user);
    },
    [finishLogin]
  );

  const clearSession = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      navigate(ROUTES.login, { replace: true });
    }
  }, [navigate, clearSession]);

  const value = useMemo(
    () => ({
      user,
      authRequired,
      googleEnabled,
      passwordEnabled,
      authReady,
      login,
      loginWithGoogle,
      logout,
      clearSession,
    }),
    [
      user,
      authRequired,
      googleEnabled,
      passwordEnabled,
      authReady,
      login,
      loginWithGoogle,
      logout,
      clearSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
