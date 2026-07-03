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

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 20000
});


apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (MUTATING_METHODS.has(method)) {
    inMemoryCache.clear();
  }
  return config;
});

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
