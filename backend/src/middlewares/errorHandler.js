import { env } from '../config/environment.js';

/**
 * Middleware global de captura y formateo de errores.
 * Garantiza respuestas JSON predecibles sin filtrar detalles sensibles en producción.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  const response = {
    status,
    message: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  if (err.details) {
    response.details = err.details;
  }

  if (env.isDev && !err.isOperational) {
    response.stack = err.stack;
  }

  // Registrar errores no operacionales (bugs o fallos de infraestructura)
  if (!err.isOperational) {
    console.error(`[UNHANDLED ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(response);
};

