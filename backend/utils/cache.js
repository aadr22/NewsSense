const NodeCache = require('node-cache');

// Initialize cache with a default TTL (time-to-live) of 300 seconds (5 minutes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Retrieves cached data for a given key.
 * @param {string} key - The cache key to retrieve data for.
 * @returns {*} - The cached data, or null if not found.
 */
const getCache = (key) => {
  return cache.get(key);
};

/**
 * Stores data in the cache for a given key.
 * @param {string} key - The cache key to store data under.
 * @param {*} value - The data to store in the cache.
 * @param {number} ttl - Optional time-to-live for this specific cache entry (in seconds).
 */
const setCache = (key, value, ttl = 300) => {
  cache.set(key, value, ttl);
};

/**
 * Deletes cached data for a given key.
 * @param {string} key - The cache key to delete data for.
 */
const deleteCache = (key) => {
  cache.del(key);
};

/**
 * Clears all cached data.
 */
const clearCache = () => {
  cache.flushAll();
};

module.exports = { getCache, setCache, deleteCache, clearCache };
