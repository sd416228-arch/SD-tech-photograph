function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, req, res, next) {
  console.error(error.message);

  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || (error.code === '23505' ? 409 : 500);
  const message = status >= 500 ? 'An unexpected server error occurred' : error.message;

  return res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
