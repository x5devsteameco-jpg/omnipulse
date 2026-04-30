'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCacheManager, CacheManager } from './manager';

interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  prefix?: string;
  fetcher?: () => Promise<T>;
  staleWhileRevalidate?: boolean;
}

interface UseCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isStale: boolean;
  revalidate: () => Promise<void>;
  mutate: (data: T) => void;
  fromCache: boolean;
}

export function useCache<T>({
  key,
  ttl = 300,
  prefix = 'default',
  fetcher,
  staleWhileRevalidate = true,
}: UseCacheOptions<T>): UseCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const cacheRef = useRef<CacheManager>(getCacheManager());
  const revalidateInProgressRef = useRef(false);

  const revalidate = useCallback(async () => {
    if (revalidateInProgressRef.current) return;
    if (!fetcher) return;

    revalidateInProgressRef.current = true;
    setIsLoading(true);
    setIsError(false);

    try {
      const freshData = await fetcher();
      await cacheRef.current.set(key, freshData, { ttl, prefix });
      setData(freshData);
      setIsStale(false);
      setFromCache(false);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      revalidateInProgressRef.current = false;
    }
  }, [key, ttl, prefix, fetcher]);

  const mutate = useCallback(
    (newData: T) => {
      setData(newData);
      cacheRef.current.set(key, newData, { ttl, prefix });
      setIsStale(false);
    },
    [key, ttl, prefix]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      try {
        const cached = await cacheRef.current.get<T>(key, { prefix });

        if (cached !== null) {
          if (isMounted) {
            setData(cached);
            setFromCache(true);
            setIsStale(staleWhileRevalidate);

            if (staleWhileRevalidate && fetcher) {
              revalidate();
            }
          }
        } else if (fetcher) {
          if (isMounted) {
            const freshData = await fetcher();
            await cacheRef.current.set(key, freshData, { ttl, prefix });
            if (isMounted) {
              setData(freshData);
              setFromCache(false);
              setIsStale(false);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsError(true);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [key, ttl, prefix, fetcher, staleWhileRevalidate, revalidate]);

  return {
    data,
    isLoading,
    isError,
    error,
    isStale,
    revalidate,
    mutate,
    fromCache,
  };
}

export function useCacheStats() {
  const [stats, setStats] = useState({
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    size: 0,
  });

  useEffect(() => {
    const cache = getCacheManager();
    setStats(cache.getStats());

    const interval = setInterval(() => {
      setStats(cache.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

export default useCache;
