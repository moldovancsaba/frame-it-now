/**
 * LRU Cache implementation for photo caching
 * Implements a Least Recently Used (LRU) caching strategy for efficient photo management
 */
export class PhotoCache {
  private cache: Map<string, CacheEntry>;
  private capacity: number;
  
  constructor(capacity: number = 50) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  /**
   * Retrieves a photo from the cache
   * @param key - Unique identifier for the photo
   * @returns The cached photo data or null if not found
   */
  get(key: string): ImageData | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Update access time and move to front of LRU
    this.cache.delete(key);
    this.cache.set(key, {
      ...item,
      lastAccessed: Date.now()
    });

    return item.data;
  }

  /**
   * Stores a photo in the cache
   * @param key - Unique identifier for the photo
   * @param data - The photo data to cache
   */
  set(key: string, data: ImageData): void {
    // If cache is at capacity, remove least recently used item
    if (this.cache.size >= this.capacity) {
      let oldestKey = this.getLeastRecentlyUsed();
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      lastAccessed: Date.now()
    });
  }

  /**
   * Finds the least recently used cache entry
   * @returns The key of the least recently used item
   */
  private getLeastRecentlyUsed(): string | null {
    let oldestTime = Infinity;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Clears all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache
   */
  size(): number {
    return this.cache.size;
  }
}

interface CacheEntry {
  data: ImageData;
  lastAccessed: number;
}
