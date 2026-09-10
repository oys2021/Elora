export function sendData(res, data, statusCode = 200, meta) {
  res.status(statusCode).json(meta ? { data, meta } : { data });
}
