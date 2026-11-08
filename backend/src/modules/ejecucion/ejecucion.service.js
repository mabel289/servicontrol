import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import { EstadoActividad } from '@prisma/client';
import crypto from 'crypto';

export class EjecucionService {
  /**
   * Inicia la ejecución de una actividad programada.
   * @param {object} datos
   */
  static async iniciarActividad(datos) {
    const { asignacionId, horaInicioReal, syncUuid } = datos;

    const asignacion = await prisma.asignacionActividad.findUnique({
      where: { id: asignacionId },
      include: { ejecucion: true }
    });

    if (!asignacion) {
      throw new AppError('Asignación de actividad no encontrada', 404);
    }

    const uuidFinal = syncUuid || crypto.randomUUID();
    const horaInicioDate = horaInicioReal ? new Date(horaInicioReal) : new Date();

    // Idempotencia si ya se encuentra iniciada
    if (asignacion.ejecucion) {
      return asignacion.ejecucion;
    }

    const [ejecucion] = await prisma.$transaction([
      prisma.ejecucionActividad.create({
        data: {
          asignacionId,
          horaInicioReal: horaInicioDate,
          estado: EstadoActividad.EN_PROCESO,
          syncUuid: uuidFinal
        }
      }),
      prisma.asignacionActividad.update({
        where: { id: asignacionId },
        data: { estado: EstadoActividad.EN_PROCESO }
      })
    ]);

    return ejecucion;
  }

  /**
   * Finaliza la ejecución de una actividad y la traslada a PENDIENTE_REVISION.
   * @param {object} datos
   */
  static async finalizarActividad(datos) {
    const { asignacionId, horaFinReal, observacionesOperario } = datos;

    const ejecucion = await prisma.ejecucionActividad.findFirst({
      where: { asignacionId },
      include: { evidencias: true }
    });

    if (!ejecucion) {
      throw new AppError('No se encontró la ejecución de esta actividad. Debe iniciarla primero.', 404);
    }

    const horaFinDate = horaFinReal ? new Date(horaFinReal) : new Date();

    const [ejecucionActualizada] = await prisma.$transaction([
      prisma.ejecucionActividad.update({
        where: { id: ejecucion.id },
        data: {
          horaFinReal: horaFinDate,
          observacionesOperario,
          estado: EstadoActividad.PENDIENTE_REVISION
        },
        include: {
          evidencias: true
        }
      }),
      prisma.asignacionActividad.update({
        where: { id: asignacionId },
        data: { estado: EstadoActividad.PENDIENTE_REVISION }
      })
    ]);

    return ejecucionActualizada;
  }
}

