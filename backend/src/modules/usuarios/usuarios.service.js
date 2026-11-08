import bcrypt from 'bcryptjs';
import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import { RolNombre, EstadoLaboral } from '@prisma/client';

export class UsuariosService {
  /**
   * Lista todos los usuarios registrados con filtro opcional de rol.
   * @param {string} [rolNombre]
   * @returns {Promise<Array>}
   */
  static async listarUsuarios(rolNombre = null) {
    const where = {};
    if (rolNombre) {
      where.rol = { nombre: rolNombre };
    }

    return await prisma.usuario.findMany({
      where,
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
            estadoLaboral: true
          }
        },
        supervisor: {
          select: {
            id: true,
            codigoSupervisor: true
          }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Crea un nuevo usuario en el sistema y crea su registro especializado según el rol.
   * @param {object} datosUsuario
   */
  static async crearUsuario(datosUsuario) {
    const { email, password, nombres, apellidos, telefono, rol } = datosUsuario;

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      throw new AppError(`El correo electrónico ${email} ya se encuentra registrado`, 409);
    }

    const rolRegistro = await prisma.rol.findUnique({
      where: { nombre: rol }
    });

    if (!rolRegistro) {
      throw new AppError(`El rol ${rol} no existe en el sistema`, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Transacción atómica: crea el usuario y su perfil si es Operario o Supervisor
    const nuevoUsuario = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({
        data: {
          email,
          password: passwordHash,
          nombres,
          apellidos,
          telefono,
          rolId: rolRegistro.id,
          activo: true
        },
        include: { rol: true }
      });

      if (rol === RolNombre.OPERARIO) {
        const totalOperarios = await tx.operario.count();
        const codigo = `OP-${(totalOperarios + 1).toString().padStart(3, '0')}`;
        await tx.operario.create({
          data: {
            usuarioId: u.id,
            codigoInstitucional: codigo,
            estadoLaboral: EstadoLaboral.ACTIVO
          }
        });
      } else if (rol === RolNombre.SUPERVISOR) {
        const totalSupervisores = await tx.supervisor.count();
        const codigo = `SUP-${(totalSupervisores + 1).toString().padStart(3, '0')}`;
        await tx.supervisor.create({
          data: {
            usuarioId: u.id,
            codigoSupervisor: codigo,
            activo: true
          }
        });
      }

      return u;
    });

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    return usuarioSinPassword;
  }

  /**
   * Activa o desactiva un usuario del sistema.
   * @param {string} id
   * @param {boolean} activo
   */
  static async cambiarEstado(id, activo) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return await prisma.usuario.update({
      where: { id },
      data: { activo },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        activo: true
      }
    });
  }
}

