class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Create cache instances for different types of data
export const apiCache = new SimpleCache(10); // 10 minutes for API data
export const categoryCache = new SimpleCache(15); // 15 minutes for categories
export const vocabularyCache = new SimpleCache(5); // 5 minutes for vocabulary
