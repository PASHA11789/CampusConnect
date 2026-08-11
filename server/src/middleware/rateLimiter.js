// Rate limiting disabled
const noopMiddleware = (_req, _res, next) => next();

export const globalLimiter = noopMiddleware;
export const authLimiter = noopMiddleware;
export const searchLimiter = noopMiddleware;

export default noopMiddleware;
