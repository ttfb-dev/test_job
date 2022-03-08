export const errorHandler = (err, req, res, next) => {
  res.status(400).json({
    error: { type: err.constructor.name ?? "", message: err.message },
  });
};
