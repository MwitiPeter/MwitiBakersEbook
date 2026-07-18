// Simple in-memory API cache with TTL
// Prevents redundant API calls when navigating between pages

const cache = new Map();
const DEFAULT_TTL = 60_000; // 60 seconds

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Fetch with automatic caching.
 * Use this instead of api.get() for data that doesn't change often.
 *
 * @param {import('axios').AxiosInstance} api - Axios instance
 * @param {string} url - API endpoint URL
 * @param {object} [options] - Options
 * @param {number} [options.ttl=60000] - Cache TTL in milliseconds
 * @param {boolean} [options.bypass=false] - Bypass cache and force fetch
 * @returns {Promise<{data: any, cached: boolean}>}
 */
export async function fetchWithCache(api, url, { ttl = DEFAULT_TTL, bypass = false } = {}) {
  if (!bypass) {
    const cached = getCached(url);
    if (cached) {
      return { data: cached, cached: true };
    }
  }

  const { data } = await api.get(url);
  setCache(url, data, ttl);
  return { data, cached: false };
}

export default { getCached, setCache, clearCache, fetchWithCache };
