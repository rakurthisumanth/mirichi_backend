// JWT removed: middleware is now a no-op placeholder.
export function auth(req, res, next) {
  return next();
}
