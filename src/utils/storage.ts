import * as SecureStore from 'expo-secure-store';

const PREFIX = 'lms_app';

const keyWithPrefix = (key: string) => `${PREFIX}:${key}`;

export const storage = {
  async getString(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(keyWithPrefix(key));
  },

  async setString(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(keyWithPrefix(key), value);
  },

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(keyWithPrefix(key));
  },

  async getJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await storage.getString(key);

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
    await storage.setString(key, JSON.stringify(value));
  },
};
