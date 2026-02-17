/**
 * Global error handling middleware.
 */

/**
 * Error handling middleware
 */
module.exports = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error ${status}] ${message}`);

  const wantsJson =
    req.path.startsWith('/api/') ||
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));

  if (wantsJson) {
    return res.status(status).json({ error: true, message });
  }

  const safeMessage = (status === 500)
    ? 'Something went wrong.'
    : message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

  res.status(status).send(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Error ${status}</title></head>
<body style="font-family:sans-serif;padding:2rem;">
  <h1>Error ${status}</h1>
  <p>${safeMessage}</p>
</body>
</html>`
  );
};
