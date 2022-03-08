import { validationResult } from "express-validator";
import { ValidationError } from "../errors/index.js";

export const errorWrapper = (handler) => {
  return async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      next(new ValidationError(result.errors[0].param));
      return;
    }
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
