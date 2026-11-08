import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma.js';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/appError.js';

export class AuthService {
  /**
   * Genera un token JWT firmado para el usuario.
   * @param {object} usuario - Datos del usuario autenticado
   * @returns {string} Token JWT
   */
  static generarToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol.nombre
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
  }

  /**
   * Autentica a un usuario con su correo y contraseña.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ usuario: object, token: string }>}
   */
  static async login(email, password) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true,
        operario: {
          include: { hojaVida: true }
        },
        supervisor: true
      }
    });

    if (!usuario) {
      throw new AppError('Credenciales incorrectas: correo o contraseña no válidos', 401);
    }

    if (!usuario.activo) {
      throw new AppError('Esta cuenta de usuario ha sido desactivada por el administrador', 403);
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new AppError('Credenciales incorrectas: correo o contraseña no válidos', 401);
    }

    const token = this.generarToken(usuario);

    // Sanitizar datos del usuario para no retornar el hash de la contraseña
    const { password: _, resetToken: __, resetTokenExpires: ___, ...usuarioSeguro } = usuario;

    return {
      usuario: usuarioSeguro,
      token
    };
  }

  /**
   * Obtiene el perfil completo del usuario autenticado actual.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getPerfil(userId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        telefono: true,
        activo: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        operario: {
          select: {
            id: true,
            codigoInstitucional: true,
            estadoLaboral: true,
            hojaVida: true
          }
        },
        supervisor: {
          select: {
            id: true,
            codigoSupervisor: true,
            activo: true
          }
        },
        createdAt: true
      }
    });

    if (!usuario) {
      throw new AppError('Perfil de usuario no encontrado', 404);
    }

    return usuario;
  }
}

