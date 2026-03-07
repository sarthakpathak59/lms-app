import { setSessionExpiredHandler } from '@/services/api';
import {
  fetchCurrentUser,
  loginUser,
  refreshAccessToken,
  registerUser,
} from '@/services/auth.service';
import { DecodedJwt, User } from '@/types/auth';
import { getErrorMessage } from '@/utils/error';
import { storage } from '@/utils/storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  userToken: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUserToken(null);
    setUser(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');

      if (token && isTokenValid(token)) {
        setUserToken(token);

        const me = await fetchCurrentUser();
        if (me) {
          setUser(me);
          return;
        }

        await clearSession();
        return;
      }

      if (refreshToken) {
        try {
          const refreshedTokens = await refreshAccessToken(refreshToken);

          if (refreshedTokens?.accessToken) {
            await SecureStore.setItemAsync('access_token', refreshedTokens.accessToken);

            if (refreshedTokens.refreshToken) {
              await SecureStore.setItemAsync(
                'refresh_token',
                refreshedTokens.refreshToken
              );
            }

            setUserToken(refreshedTokens.accessToken);
            const me = await fetchCurrentUser();

            if (me) {
              setUser(me);
              return;
            }
          }
        } catch {
          // Refresh token failed (e.g. 401): clear session gracefully.
        }

        await clearSession();
        return;
      }

      await clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await clearSession();
      router.replace('/(auth)/login');
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
      const me = await fetchCurrentUser();
      setUser(me || loginUserData || null);

      return 'Login successful.';
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Login failed. Please try again.'));
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<string> => {
    try {
      await registerUser({
        email,
        password,
        username,
      });

      return 'Registration successful. Please login to continue.';
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  const logout = async () => {
    await clearSession();
    await storage.clearAppData();
    router.replace('/(auth)/login');
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
