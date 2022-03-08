const memoryCache = {
  memory: {},

  set: async (key, value, ttl) => {
    const obsoleteAt = Date.now() + ttl;
    memoryCache.memory[key] = {
      value,
      obsoleteAt,
    };
  },

  get: async (key) => {
    try {
      const cached = memoryCache.memory[key];
      if (Date.now() > cached.obsoleteAt) {
        memoryCache.delete(key);
        return;
      }
      return cached.value;
    } catch {}
    return;
  },

  delete: async (key) => {
    try {
      delete memoryCache.memory[key];
    } catch {}
  },
};

export { memoryCache };
