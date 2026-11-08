import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import prisma from '../database/prisma.js';

/**
 * Middleware de autenticación mediante JSON Web Tokens (JWT).
 * Extrae y valida el token del encabezado 'Authorization: Bearer <token>'
 * y verifica que el usuario exista y continúe activo en la base de datos.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No estás autenticado. Por favor inicia sesión para continuar.', 401));
    }

    // Verificar firma y expiración del JWT
    const decoded = jwt.verify(token, env.jwtSecret);

    // Consultar usuario en la base de datos con su rol y perfiles asociados
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        rol: true,
        operario: true,
        supervisor: true
      }
    });

    if (!usuario) {
      return next(new AppError('El usuario al que pertenece este token ya no existe.', 401));
    }

    if (!usuario.activo) {
      return next(new AppError('Tu cuenta de usuario se encuentra inactiva o deshabilitada.', 403));
    }

    // Inyectar usuario autenticado en la petición
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token de autenticación inválido.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('La sesión ha expirado. Por favor inicia sesión nuevamente.', 401));
    }
    next(error);
  }
};
