/**
 * Envoltorio para controladores asíncronos que captura excepciones y las redirige
 * automáticamente al middleware centralizado de errores (next(err)).
 * Elimina la necesidad de bloques try-catch redundantes en cada método del controlador.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
