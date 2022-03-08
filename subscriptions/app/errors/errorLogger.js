export const errorLogger = (err, req, res, next) => {
  console.error(err);
  next(err);
};
