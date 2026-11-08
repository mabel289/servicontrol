import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import { EstadoActividad, EstadoRevision } from '@prisma/client';

export class SupervisionService {
  /**
   * Lista las actividades que requieren inspección presencial del supervisor.
   * Por defecto prioriza las que están en estado PENDIENTE_REVISION.
   *
   * @param {string} [estadoFiltro]
   */
  static async listarActividades(estadoFiltro = null) {
    const where = {};
    if (estadoFiltro) {
      where.estado = estadoFiltro;
    }

    return await prisma.ejecucionActividad.findMany({
      where,
      include: {
        asignacion: {
          include: {
            centroTrabajo: true,
            tipoActividad: true,
            operario: {
              include: {
                usuario: {
                  select: { nombres: true, apellidos: true, email: true, telefono: true }
                }
              }
            }
          }
        },
        evidencias: {
          orderBy: { fechaCaptura: 'asc' }
        },
        revisiones: {
          include: {
            supervisor: {
              include: {
                usuario: {
                  select: { nombres: true, apellidos: true, email: true }
                }
              }
            }
          },
          orderBy: { fechaRevision: 'desc' }
        }
      },
      orderBy: { horaInicioReal: 'desc' }
    });
  }

  /**
   * Evalúa de forma presencial un trabajo realizado por un operario (Aprobación o Rechazo).
   * Aplica la regla de negocio: Observación obligatoria ante rechazo.
   *
   * @param {object} datos
   */
  static async evaluarActividad(datos) {
    const { ejecucionId, supervisorUsuarioId, estado, observaciones } = datos;

    // Verificar supervisor
    const supervisor = await prisma.supervisor.findUnique({
      where: { usuarioId: supervisorUsuarioId }
    });

    if (!supervisor) {
      throw new AppError('El usuario no posee perfil de supervisor registrado', 403);
    }

    const ejecucion = await prisma.ejecucionActividad.findUnique({
      where: { id: ejecucionId },
      include: { asignacion: true }
    });

    if (!ejecucion) {
      throw new AppError('Ejecución de actividad no encontrada', 404);
    }

    // Regla de negocio: Validar observación obligatoria en rechazo
    if (estado === EstadoRevision.RECHAZADA && (!observaciones || observaciones.trim().length < 10)) {
      throw new AppError('Al rechazar una actividad es obligatorio ingresar las observaciones de no conformidad (mínimo 10 caracteres)', 400);
    }

    const nuevoEstadoActividad = estado === EstadoRevision.APROBADA
      ? EstadoActividad.APROBADA
      : EstadoActividad.RECHAZADA;

    // Transacción atómica: Registrar revisión y actualizar estados de ejecución y asignación
    const [revision] = await prisma.$transaction([
      prisma.revisionSupervisor.create({
        data: {
          ejecucionId,
          supervisorId: supervisor.id,
          estado,
          observaciones: observaciones || (estado === EstadoRevision.APROBADA ? 'Trabajo conforme a especificaciones' : '')
        },
        include: {
          supervisor: {
            include: { usuario: true }
          }
        }
      }),
      prisma.ejecucionActividad.update({
        where: { id: ejecucionId },
        data: { estado: nuevoEstadoActividad }
      }),
      prisma.asignacionActividad.update({
        where: { id: ejecucion.asignacionId },
        data: { estado: nuevoEstadoActividad }
      })
    ]);

    return revision;
  }
}
