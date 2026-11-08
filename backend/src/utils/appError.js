/**
 * Clase AppError para el manejo uniforme de excepciones operacionales del sistema.
 * Extiende la clase nativa Error de JavaScript (Herencia y POO).
 */
export class AppError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error para el cliente.
   * @param {number} statusCode - Código de estado HTTP (400, 401, 403, 404, etc.).
   * @param {any} [details=null] - Información adicional o errores de validación.
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Error controlado de negocio
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

