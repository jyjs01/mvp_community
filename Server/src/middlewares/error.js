export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const msg = err.message || 'Server Error';
  // 필요하면 로깅 추가 가능: console.error(err);
  res.status(status).json({ error: msg });
};