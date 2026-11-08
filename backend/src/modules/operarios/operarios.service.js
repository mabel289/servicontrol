import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';

export class OperariosService {
  /**
   * Lista todos los operarios junto con su usuario y hoja de vida.
   */
  static async listar() {
    return await prisma.operario.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombres: true,
            apellidos: true,
            telefono: true,
            activo: true
          }
        },
        hojaVida: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtiene la hoja de vida y datos de un operario por su ID.
   * @param {string} id
   */
  static async obtenerPorId(id) {
    const operario = await prisma.operario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombres: true,
            apellidos: true,
            telefono: true,
            activo: true
          }
        },
        hojaVida: true
      }
    });

    if (!operario) {
      throw new AppError('Operario no encontrado', 404);
    }

    return operario;
  }

  /**
   * Registra o actualiza la hoja de vida del operario (Upsert).
   * @param {string} operarioId
   * @param {object} datos
   */
  static async guardarHojaVida(operarioId, datos) {
    const { numeroIdentificacion, direccion, formacionAcademica, experienciaLaboral, telefono } = datos;

    const operario = await prisma.operario.findUnique({
      where: { id: operarioId },
      include: { usuario: true }
    });

    if (!operario) {
      throw new AppError('Operario no encontrado', 404);
    }

    // Actualizar teléfono en el usuario si fue provisto
    if (telefono) {
      await prisma.usuario.update({
        where: { id: operario.usuarioId },
        data: { telefono }
      });
    }

    // Upsert en la hoja de vida
    const hojaVida = await prisma.hojaVida.upsert({
      where: { operarioId },
      update: {
        numeroIdentificacion,
        direccion,
        formacionAcademica,
        experienciaLaboral
      },
      create: {
        operarioId,
        numeroIdentificacion,
        direccion,
        formacionAcademica,
        experienciaLaboral
      }
    });

    return hojaVida;
  }
}
