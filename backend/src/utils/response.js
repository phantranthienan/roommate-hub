export function sendSuccess(res, data, status = 200, meta = {}) {
  return res.status(status).json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}
