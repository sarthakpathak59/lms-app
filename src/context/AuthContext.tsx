import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from '@/services/auth.service';
import { setSessionExpiredHandler } from '@/services/api';
import { DecodedJwt, User } from '@/types/auth';
import { getErrorMessage } from '@/utils/error';

interface AuthContextType {
  userToken: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_CACHE_KEY = 'auth_user';

const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<DecodedJwt>(token);

    if (!decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    // Some backends return opaque (non-JWT) tokens.
    // Keep the session and let /users/me or 401 handling decide validity.
    return true;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      await SecureStore.deleteItemAsync(USER_CACHE_KEY);
      return;
    }

    await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(nextUser));
  }, []);

  const readPersistedUser = useCallback(async (): Promise<User | null> => {
    const raw = await SecureStore.getItemAsync(USER_CACHE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync(USER_CACHE_KEY);
    setUserToken(null);
    setUser(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const cachedUser = await readPersistedUser();

      if (token && isTokenValid(token)) {
        setUserToken(token);
        if (cachedUser) {
          setUser(cachedUser);
        }
        return;
      }

      await clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, readPersistedUser]);

  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await clearSession();
    });

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    void hydrateSession().finally(() => {
      clearTimeout(safetyTimer);
    });

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [clearSession, hydrateSession]);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const { tokens, user: loginUserData } = await loginUser({ email, password });

      if (!tokens?.accessToken) {
        throw new Error('Login succeeded but token was missing.');
      }

      await SecureStore.setItemAsync('access_token', tokens.accessToken);

      if (tokens.refreshToken) {
        await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
      }

      setUserToken(tokens.accessToken);

      if (loginUserData) {
        setUser(loginUserData);
        await persistUser(loginUserData);
      } else {
        const me = await fetchCurrentUser();
        setUser(me);
        await persistUser(me);
      }

      return 'Login successful.';
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Login failed. Please try again.'));
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<string> => {
    try {
      await registerUser({
        email,
        password,
        role: 'USER',
        username: name,
      });

      return 'Registration successful. Please login to continue.';
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider
      value={{ userToken, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
