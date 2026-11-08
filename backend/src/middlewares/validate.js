import { AppError } from '../utils/appError.js';

/**
 * Middleware genérico de validación de esquemas Zod (Data Transfer Object - DTO).
 * Garantiza que solo datos con la estructura y tipos válidos lleguen a la capa de servicios.
 *
 * @param {import('zod').ZodSchema} schema - Esquema Zod a evaluar
 * @param {'body' | 'query' | 'params'} [property='body'] - Propiedad de req a validar
 */
export const validate = (schema, property = 'body') => (req, res, next) => {
  try {
    const validatedData = schema.parse(req[property]);
    req[property] = validatedData;
    next();
  } catch (error) {
    const errorDetails = error.errors ? error.errors.map(err => ({
      campo: err.path.join('.'),
      mensaje: err.message
    })) : error.message;

    next(new AppError('Los datos suministrados no superan la validación', 400, errorDetails));
  }
};

