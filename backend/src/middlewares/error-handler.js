module.exports = (err, req, res, next) => {
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : err.code === 'LIMIT_UNEXPECTED_FILE' ? 400 : err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Não foi possível concluir a solicitação.' : err.message, code: err.code || 'REQUEST_ERROR' });
};
