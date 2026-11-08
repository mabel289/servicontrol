import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';

export class CentrosTrabajoService {
  /**
   * Lista todos los conjuntos residenciales (centros de trabajo).
   * @param {boolean} [soloActivos=true]
   */
  static async listar(soloActivos = false) {
    const where = soloActivos ? { activo: true } : {};
    return await prisma.centroTrabajo.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Obtiene el detalle de un centro de trabajo por ID.
   * @param {string} id
   */
  static async obtenerPorId(id) {
    const centro = await prisma.centroTrabajo.findUnique({
      where: { id }
    });
    if (!centro) {
      throw new AppError('Centro de trabajo (conjunto) no encontrado', 404);
    }
    return centro;
  }

  /**
   * Registra un nuevo conjunto residencial.
   * @param {object} datos
   */
  static async crear(datos) {
    const { nombre, direccion, ciudad, telefonoContacto, nombreAdministrador } = datos;
    return await prisma.centroTrabajo.create({
      data: {
        nombre,
        direccion,
        ciudad: ciudad || 'Bogotá',
        telefonoContacto,
        nombreAdministrador,
        activo: true
      }
    });
  }
}
