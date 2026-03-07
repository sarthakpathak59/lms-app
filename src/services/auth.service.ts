import api from './api';
import { AuthTokens, User } from '@/types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  role?: string;
}

const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const next = value.trim();
  return next.length > 0 ? next : undefined;
};

const normalizeUser = (raw: any): User | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const firstName = asTrimmedString(raw.firstName);
  const lastName = asTrimmedString(raw.lastName);
  const composedName =
    firstName || lastName
      ? `${firstName || ''} ${lastName || ''}`.trim()
      : undefined;

  const username =
    asTrimmedString(raw.username) ||
    asTrimmedString(raw.userName) ||
    asTrimmedString(raw.name) ||
    asTrimmedString(raw.fullName) ||
    composedName;

  const email =
    asTrimmedString(raw.email) ||
    asTrimmedString(raw.mail) ||
    asTrimmedString(raw.userEmail);

  const role =
    asTrimmedString(raw.role) ||
    asTrimmedString(raw.userRole) ||
    asTrimmedString(raw.type);

  const avatarUrl =
    asTrimmedString(raw.avatarUrl) ||
    asTrimmedString(raw.avatar) ||
    asTrimmedString(raw.profilePicture) ||
    asTrimmedString(raw.image);

  if (!username && !email && !role && !avatarUrl && !raw._id && !raw.id) {
    return null;
  }

  return {
    _id: raw._id,
    id: raw.id,
    username,
    email,
    role,
    avatarUrl,
  };
};

const extractUser = (payload: any): User | null => {
  const candidates = [
    payload?.data?.user,
    payload?.user,
    payload?.data?.data?.user,
    payload?.data?.data?.data?.user,
    payload?.data?.data?.data,
    payload?.data?.data,
    payload?.data,
    payload,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUser(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
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
    return extractUser(response.data);
  } catch {
    return null;
  }
};
