function notFound(req, res, next) {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  // Log básico (se mejorará después)
  console.error('[Error]', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ ok: false, message });
}

module.exports = { notFound, errorHandler };
