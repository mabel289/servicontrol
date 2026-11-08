import { AppError } from '../utils/appError.js';

/**
 * Middleware de autorización basado en roles (Role-Based Access Control - RBAC).
 * Verifica que el usuario autenticado posea al menos uno de los roles autorizados.
 *
 * @param  {...string} rolesPermitidos - Lista de roles autorizados (ej: 'ADMINISTRADOR', 'SUPERVISOR')
 */
export const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return next(new AppError('No se encontró el perfil de rol para este usuario', 403));
    }

    const rolUsuario = req.user.rol.nombre;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return next(
        new AppError(
          `Acceso denegado: Se requiere uno de los siguientes roles [${rolesPermitidos.join(', ')}] pero tienes [${rolUsuario}]`,
          403
        )
      );
    }

    next();
  };
};

