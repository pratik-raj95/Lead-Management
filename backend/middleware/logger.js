/**
 * Express middleware to log incoming HTTP requests
 */
export function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
