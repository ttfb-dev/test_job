import cache from "../cache/index.js";
import { ValidationError } from "../errors/index.js";

const validator = {
  checkCorrelation: async (value) => {
    const cacheKey = `api_chane_balabce_correlation_check_${value}`;
    const cacheTtl = 60000;
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult === undefined) {
      await cache.set(cacheKey, value, cacheTtl);
      return true;
    }

    throw new ValidationError("correlation");
  },
};

export default validator;
