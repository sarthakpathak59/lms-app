import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const PREFIX = 'lms_app';
const SECURE_STORE_CHUNK_SIZE = 1800;
const APP_LOCAL_KEYS = [
  'bookmarks',
  'enrolled_courses',
  'user_preferences',
  'courses_cache',
  'profile_picture',
  'last_opened_at',
  'bookmark_threshold_notified',
  'inactivity_notification_id',
];

const keyWithPrefix = (key: string) =>
  `${PREFIX}_${key}`.replace(/[^A-Za-z0-9._-]/g, '_');

const getChunkMetaKey = (key: string) => `${key}.__chunks`;
const getChunkKey = (key: string, index: number) => `${key}.__chunk_${index}`;

const getChunkCount = async (key: string): Promise<number> => {
  const raw = await SecureStore.getItemAsync(getChunkMetaKey(key));
  if (!raw) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
};

const clearChunkedValue = async (key: string) => {
  const chunkCount = await getChunkCount(key);
  for (let i = 0; i < chunkCount; i += 1) {
    await SecureStore.deleteItemAsync(getChunkKey(key, i));
  }
  await SecureStore.deleteItemAsync(getChunkMetaKey(key));
};

const readSecureValue = async (key: string): Promise<string | null> => {
  const chunkCount = await getChunkCount(key);
  if (chunkCount <= 0) {
    return SecureStore.getItemAsync(key);
  }

  const chunks: string[] = [];
  for (let i = 0; i < chunkCount; i += 1) {
    const chunk = await SecureStore.getItemAsync(getChunkKey(key, i));
    if (chunk == null) {
      return null;
    }
    chunks.push(chunk);
  }

  return chunks.join('');
};

const writeSecureValue = async (key: string, value: string) => {
  await SecureStore.deleteItemAsync(key);
  await clearChunkedValue(key);

  if (value.length <= SECURE_STORE_CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunkCount = Math.ceil(value.length / SECURE_STORE_CHUNK_SIZE);
  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * SECURE_STORE_CHUNK_SIZE;
    const chunk = value.slice(start, start + SECURE_STORE_CHUNK_SIZE);
    await SecureStore.setItemAsync(getChunkKey(key, i), chunk);
  }
  await SecureStore.setItemAsync(getChunkMetaKey(key), String(chunkCount));
};

const removeSecureValue = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
  await clearChunkedValue(key);
};

let asyncStorageDisabled = false;

const shouldDisableAsyncStorage = (error: unknown): boolean => {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes('native module is null') ||
    message.includes('cannot access legacy storage') ||
    message.includes('asyncstorage is not available')
  );
};

const getAsyncStorage = (): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} | null => {
  if (asyncStorageDisabled) {
    return null;
  }

  return AsyncStorage;
};

export const appStorage = {
  async getString(key: string): Promise<string | null> {
    const nextKey = keyWithPrefix(key);
    const asyncStorage = getAsyncStorage();

    if (asyncStorage) {
      try {
        return await asyncStorage.getItem(nextKey);
      } catch (error) {
        if (!shouldDisableAsyncStorage(error)) {
          throw error;
        }
        asyncStorageDisabled = true;
      }
    }

    return readSecureValue(nextKey);
  },

  async setString(key: string, value: string): Promise<void> {
    const nextKey = keyWithPrefix(key);
    const asyncStorage = getAsyncStorage();

    if (asyncStorage) {
      try {
        await asyncStorage.setItem(nextKey, value);
        return;
      } catch (error) {
        if (!shouldDisableAsyncStorage(error)) {
          throw error;
        }
        asyncStorageDisabled = true;
      }
    }

    await writeSecureValue(nextKey, value);
  },

  async remove(key: string): Promise<void> {
    const nextKey = keyWithPrefix(key);
    const asyncStorage = getAsyncStorage();

    if (asyncStorage) {
      try {
        await asyncStorage.removeItem(nextKey);
        return;
      } catch (error) {
        if (!shouldDisableAsyncStorage(error)) {
          throw error;
        }
        asyncStorageDisabled = true;
      }
    }

    await removeSecureValue(nextKey);
  },

  async getJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await appStorage.getString(key);

    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    await appStorage.setString(key, JSON.stringify(value));
  },

  async clearAppData(): Promise<void> {
    await Promise.all(APP_LOCAL_KEYS.map(key => appStorage.remove(key)));
  },
};

export const storage = appStorage;
