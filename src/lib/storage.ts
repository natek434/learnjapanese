export interface Persisted<T> {
  get: (key: string) => Promise<T | undefined>;
  set: (key: string, value: T) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export function createBrowserStorage<T>(namespace: string): Persisted<T> {
  const memory = new Map<string, T>();

  const getStorage = () => (typeof window !== "undefined" ? window.localStorage : null);
  const resolveKey = (key: string) => `${namespace}:${key}`;

  return {
    async get(key) {
      const storage = getStorage();
      if (!storage) {
        return memory.get(resolveKey(key));
      }
      const value = storage.getItem(resolveKey(key));
      return value ? (JSON.parse(value) as T) : undefined;
    },
    async set(key, value) {
      const storage = getStorage();
      if (!storage) {
        memory.set(resolveKey(key), value);
        return;
      }
      storage.setItem(resolveKey(key), JSON.stringify(value));
    },
    async remove(key) {
      const storage = getStorage();
      if (!storage) {
        memory.delete(resolveKey(key));
        return;
      }
      storage.removeItem(resolveKey(key));
    }
  };
}
