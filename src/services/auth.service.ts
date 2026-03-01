import api from './api';
import { AuthTokens, User } from '@/types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  role: string;
  username: string;
}

const extractUser = (payload: any): User | null => {
  return payload?.data?.user || payload?.user || null;
};

const extractTokens = (payload: any): AuthTokens | null => {
  const accessToken =
    payload?.data?.accessToken || payload?.accessToken || payload?.token;
  const refreshToken = payload?.data?.refreshToken || payload?.refreshToken;

  if (!accessToken) {
    return null;
  }

  return { accessToken, refreshToken };
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await api.post('/users/login', payload);
  const data = response.data;

  return {
    tokens: extractTokens(data),
    user: extractUser(data),
    raw: data,
  };
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post('/users/register', payload);
  const data = response.data;

  return {
    tokens: extractTokens(data),
    user: extractUser(data),
    raw: data,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post('/users/refresh-token', {
    refreshToken,
  });

  const data = response.data;
  return extractTokens(data);
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/users/me');
    return response.data?.data || response.data?.user || response.data || null;
  } catch {
    return null;
  }
};
