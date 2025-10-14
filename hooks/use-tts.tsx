"use client";

import { useCallback } from "react";

// Cache configuration for TTS
const TTS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const TTS_CACHE_KEY_PREFIX = "tts_cache_";
const TTS_CACHE_VERSION = "v1";

interface TTSCacheEntry {
  blob: Blob;
  timestamp: number;
  version: string;
}

// In-memory cache for fast access
const ttsMemoryCache = new Map<string, TTSCacheEntry>();

// Cache utilities
const getTTSCacheKey = (text: string) => `${TTS_CACHE_KEY_PREFIX}${text}`;

const getFromTTSCache = (text: string): Blob | null => {
  // Check memory cache first (fastest)
  const memoryCached = ttsMemoryCache.get(text);
  if (memoryCached) {
    const isExpired = Date.now() - memoryCached.timestamp > TTS_CACHE_DURATION;
    if (!isExpired && memoryCached.version === TTS_CACHE_VERSION) {
      return memoryCached.blob;
    } else {
      ttsMemoryCache.delete(text);
    }
  }

  // Check localStorage (slower but persists)
  try {
    const cacheKey = getTTSCacheKey(text);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const entry: TTSCacheEntry = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > TTS_CACHE_DURATION;

      if (!isExpired && entry.version === TTS_CACHE_VERSION) {
        // Convert base64 back to Blob
        const byteCharacters = atob(entry.blob as any);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/mpeg" });

        // Restore to memory cache
        ttsMemoryCache.set(text, { ...entry, blob });
        return blob;
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error("Error reading from TTS cache:", error);
  }

  return null; // Cache miss
};

const saveToTTSCache = (text: string, blob: Blob) => {
  const entry: TTSCacheEntry = {
    blob,
    timestamp: Date.now(),
    version: TTS_CACHE_VERSION,
  };

  // Save to memory cache
  ttsMemoryCache.set(text, entry);

  // Save to localStorage (convert Blob to base64)
  try {
    const cacheKey = getTTSCacheKey(text);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const entryToStore = {
        ...entry,
        blob: base64, // Store as base64 string
      };
      localStorage.setItem(cacheKey, JSON.stringify(entryToStore));
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Error saving to TTS cache:", error);
  }
};

const clearOldTTSCache = () => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Find expired keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(TTS_CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: TTSCacheEntry = JSON.parse(cached);
            const isExpired = now - entry.timestamp > TTS_CACHE_DURATION;
            if (isExpired || entry.version !== TTS_CACHE_VERSION) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      const text = key.replace(TTS_CACHE_KEY_PREFIX, "");
      ttsMemoryCache.delete(text);
    });

    console.log(`Cleared ${keysToRemove.length} expired TTS cache entries`);
  } catch (error) {
    console.error("Error clearing old TTS cache:", error);
  }
};

// Clear cache on module load (remove expired entries)
if (typeof window !== "undefined") {
  setTimeout(clearOldTTSCache, 1000);
}

// Export utility to clear cache manually (can be called from console)
export const clearTTSCache = () => {
  console.log("Manually clearing TTS cache...");
  ttsMemoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(TTS_CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} TTS cache entries`);
  } catch (error) {
    console.error("Error clearing TTS cache:", error);
  }
};

// Expose to window for debugging (development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).clearTTSCache = clearTTSCache;
}

export const useTTS = () => {
  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn("TTS: Empty text provided");
      return;
    }

    try {
      // Check cache first
      const cachedBlob = getFromTTSCache(text);
      if (cachedBlob) {
        console.log(`TTS Cache HIT for: "${text}"`);
        const url = URL.createObjectURL(cachedBlob);
        const audio = new Audio(url);
        audio.play();
        return;
      }

      console.log(`TTS Cache MISS for: "${text}", fetching from API...`);

      // Fetch from API
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`TTS API returned ${res.status}: ${res.statusText}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

      // Cache the audio
      saveToTTSCache(text, blob);

      // Play the audio
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (error: any) {
      console.error("TTS Error:", error);
      alert("Không phát được âm thanh: " + error.message);
    }
  }, []);

  return { speak };
};
