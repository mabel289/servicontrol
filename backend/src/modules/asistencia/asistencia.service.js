import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import crypto from 'crypto';

export class AsistenciaService {
  /**
   * Registra la entrada del operario al centro de trabajo (conjunto).
   * @param {object} datos
   */
  static async registrarEntrada(datos) {
    const { operarioId, centroTrabajoId, fecha, horaEntrada, syncUuid } = datos;

    const fechaDate = new Date(`${fecha}T00:00:00.000Z`);
    const horaEntradaDate = horaEntrada ? new Date(horaEntrada) : new Date();
    const uuidFinal = syncUuid || crypto.randomUUID();

    // Idempotencia: Si ya existe por syncUuid, retornar el existente
    const existentePorUuid = await prisma.asistencia.findUnique({
      where: { syncUuid: uuidFinal }
    });
    if (existentePorUuid) {
      return existentePorUuid;
    }

    // Regla de negocio: Verificar si ya tiene una entrada abierta hoy sin salida
    const entradaAbierta = await prisma.asistencia.findFirst({
      where: {
        operarioId,
        fecha: fechaDate,
        horaSalida: null
      }
    });

    if (entradaAbierta) {
      throw new AppError('Ya tienes un registro de entrada activo para el día de hoy sin marcar salida', 400);
    }

    return await prisma.asistencia.create({
      data: {
        operarioId,
        centroTrabajoId,
        fecha: fechaDate,
        horaEntrada: horaEntradaDate,
        syncUuid: uuidFinal
      },
      include: {
        centroTrabajo: true
      }
    });
  }

  /**
   * Registra la salida del operario y calcula el tiempo de permanencia en minutos.
   * @param {object} datos
   */
  static async registrarSalida(datos) {
    const { asistenciaId, syncUuid, horaSalida } = datos;

    const where = asistenciaId ? { id: asistenciaId } : { syncUuid };
    const asistencia = await prisma.asistencia.findFirst({ where });

    if (!asistencia) {
      throw new AppError('No se encontró el registro de entrada previo correspondiente', 404);
    }

    if (asistencia.horaSalida) {
      return asistencia; // Idempotencia si ya fue registrada
    }

    const horaSalidaDate = horaSalida ? new Date(horaSalida) : new Date();
    const diffMs = horaSalidaDate.getTime() - new Date(asistencia.horaEntrada).getTime();
    const minutosPermanencia = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    return await prisma.asistencia.update({
      where: { id: asistencia.id },
      data: {
        horaSalida: horaSalidaDate,
        minutosPermanencia
      },
      include: {
        centroTrabajo: true
      }
    });
  }

  /**
   * Consulta el registro de asistencia del operario para la fecha de hoy.
   * @param {string} operarioId
   * @param {string} fecha
   */
  static async obtenerAsistenciaHoy(operarioId, fecha) {
    const fechaDate = new Date(`${fecha}T00:00:00.000Z`);

    return await prisma.asistencia.findFirst({
      where: {
        operarioId,
        fecha: fechaDate
      },
      include: {
        centroTrabajo: true
      },
      orderBy: { horaEntrada: 'desc' }
    });
  }
}
