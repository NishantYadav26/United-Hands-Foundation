import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-foundation.onrender.com';
export const API_BASE = `${BACKEND_URL}/api`;

const inMemoryCache = new Map();
const inflightRequests = new Map();
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const getCacheKey = (url, config = {}) => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${url}|${params}`;
};

const getTtl = (config = {}) => {
  const ttl = Number(config.cacheTtlMs);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 0;
};

// The API sleeps on Render's free tier and takes roughly 45s to wake. A 20s
// default meant every caller that did not override it — the navbar logo, the
// footer's social links, the events list — reliably failed on the first request
// after a sleep, logging `timeout of 20000ms exceeded` while the homepage (which
// asks for 60s explicitly) loaded fine. 60s clears the observed cold start.
// Callers that would rather fall back fast than wait still pass their own value.
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000
});


const clearCacheOnMutation = (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (MUTATING_METHODS.has(method)) {
    inMemoryCache.clear();
  }
  return config;
};

apiClient.interceptors.request.use(clearCacheOnMutation);

// The admin management components post/put/delete through the bare `axios`
// default instance rather than this one, so the interceptor above never saw
// their writes. The read cache then kept serving the old list for its full TTL
// (2-5 minutes), which made a successful save look like it had silently failed.
// Registering on the default instance covers those call sites, and any future
// ones, without each component having to remember to invalidate by hand.
axios.interceptors.request.use(clearCacheOnMutation);

export const getCached = async (url, config = {}) => {
  const ttlMs = getTtl(config);
  const cacheKey = getCacheKey(url, config);

  if (ttlMs > 0) {
    const cached = inMemoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { data: cached.data, status: 200, fromCache: true };
    }
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = apiClient.get(url, config)
    .then((response) => {
      if (ttlMs > 0) {
        inMemoryCache.set(cacheKey, {
          data: response.data,
          expiresAt: Date.now() + ttlMs
        });
      }
      return response;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// The API marks its list endpoints `public, max-age=300`, which is correct for
// visitors but wrong for the admin panel: a refetch issued straight after a save
// is answered from the browser's own HTTP cache with the pre-save copy, so the
// edit appears to have been lost until those five minutes elapse. Clearing the
// in-memory cache above cannot help — that cache lives in this module, while
// this copy lives in the browser. Giving each admin read a unique query
// parameter puts it on its own cache key so it always reaches the server.
export const cacheBust = () => ({ _: Date.now() });

export const invalidateCachedGet = (prefix = '') => {
  if (!prefix) {
    inMemoryCache.clear();
    return;
  }

  Array.from(inMemoryCache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      inMemoryCache.delete(key);
    }
  });
};
