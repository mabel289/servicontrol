import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import { EstadoActividad, EstadoProgramacion } from '@prisma/client';

export class ProgramacionService {
  /**
   * Lista el catálogo de tipos de actividades disponibles (Piscina, Jardinería, Pintura, etc.)
   */
  static async listarTiposActividad() {
    return await prisma.tipoActividad.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Lista todas las programaciones semanales registradas.
   */
  static async listarProgramaciones() {
    return await prisma.programacionSemanal.findMany({
      include: {
        _count: {
          select: { asignaciones: true }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  /**
   * Obtiene el detalle de una programación semanal con todas sus asignaciones por conjunto y operario.
   * @param {string} id
   */
  static async obtenerProgramacion(id) {
    const programacion = await prisma.programacionSemanal.findUnique({
      where: { id },
      include: {
        asignaciones: {
          include: {
            centroTrabajo: true,
            operario: {
              include: {
                usuario: {
                  select: { nombres: true, apellidos: true, email: true, telefono: true }
                }
              }
            },
            tipoActividad: true,
            ejecucion: {
              include: {
                evidencias: true,
                revisiones: true
              }
            }
          },
          orderBy: [
            { fecha: 'asc' },
            { horaInicioEstimada: 'asc' }
          ]
        }
      }
    });

    if (!programacion) {
      throw new AppError('Programación semanal no encontrada', 404);
    }

    return programacion;
  }

  /**
   * Crea una nueva programación semanal (e.g. "2026-W46").
   * @param {object} datos
   */
  static async crearProgramacion(datos) {
    const { semana, fechaInicio, fechaFin, observaciones } = datos;

    const existente = await prisma.programacionSemanal.findUnique({
      where: { semana }
    });

    if (existente) {
      throw new AppError(`Ya existe una programación semanal registrada para el código ${semana}`, 409);
    }

    return await prisma.programacionSemanal.create({
      data: {
        semana,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        estado: EstadoProgramacion.PUBLICADA,
        observaciones
      }
    });
  }

  /**
   * Valida cruces de horario para un operario en una fecha determinada.
   * Dos intervalos [A_inicio, A_fin] y [B_inicio, B_fin] colisionan si:
   * A_inicio < B_fin AND A_fin > B_inicio
   *
   * @param {string} operarioId
   * @param {Date} fechaDate
   * @param {string} horaInicio
   * @param {string} horaFin
   * @param {string} [asignacionIdExcluir=null]
   */
  static async validarConflictoHorario(operarioId, fechaDate, horaInicio, horaFin, asignacionIdExcluir = null) {
    const asignacionesExistentes = await prisma.asignacionActividad.findMany({
      where: {
        operarioId,
        fecha: fechaDate,
        id: asignacionIdExcluir ? { not: asignacionIdExcluir } : undefined
      },
      include: {
        centroTrabajo: true,
        tipoActividad: true,
        operario: {
          include: { usuario: true }
        }
      }
    });

    for (const item of asignacionesExistentes) {
      const existeInicio = item.horaInicioEstimada;
      const existeFin = item.horaFinEstimada;

      // Verificación de solapamiento de intervalos
      if (horaInicio < existeFin && horaFin > existeInicio) {
        const nombreOperario = `${item.operario.usuario.nombres} ${item.operario.usuario.apellidos}`;
        throw new AppError(
          `Conflicto de horario: El operario ${nombreOperario} ya tiene asignada la labor "${item.tipoActividad.nombre}" en "${item.centroTrabajo.nombre}" de ${existeInicio} a ${existeFin} en esta misma fecha.`,
          409
        );
      }
    }
  }

  /**
   * Asigna una actividad a un operario en un conjunto residencial con horario específico.
   * Aplica la regla de negocio anti-solapamiento de horarios.
   * @param {object} datos
   */
  static async asignarActividad(datos) {
    const {
      programacionId,
      centroTrabajoId,
      operarioId,
      tipoActividadId,
      fecha,
      horaInicioEstimada,
      horaFinEstimada,
      instrucciones
    } = datos;

    // Normalizar fecha a inicio del día UTC
    const fechaDate = new Date(`${fecha}T00:00:00.000Z`);

    // Validar regla de negocio de no solapamiento
    await this.validarConflictoHorario(operarioId, fechaDate, horaInicioEstimada, horaFinEstimada);

    return await prisma.asignacionActividad.create({
      data: {
        programacionId,
        centroTrabajoId,
        operarioId,
        tipoActividadId,
        fecha: fechaDate,
        horaInicioEstimada,
        horaFinEstimada,
        instrucciones,
        estado: EstadoActividad.PROGRAMADA
      },
      include: {
        centroTrabajo: true,
        operario: {
          include: { usuario: true }
        },
        tipoActividad: true
      }
    });
  }

  /**
   * Consulta las actividades asignadas a un operario específico.
   * Garantiza la regla de negocio: el operario solo puede ver sus propias actividades.
   * @param {string} operarioId
   * @param {string} [fechaFiltro]
   */
  static async obtenerActividadesOperario(operarioId, fechaFiltro = null) {
    const where = { operarioId };

    if (fechaFiltro) {
      where.fecha = new Date(`${fechaFiltro}T00:00:00.000Z`);
    }

    return await prisma.asignacionActividad.findMany({
      where,
      include: {
        centroTrabajo: true,
        tipoActividad: true,
        ejecucion: {
          include: {
            evidencias: true,
            revisiones: true
          }
        }
      },
      orderBy: [
        { fecha: 'asc' },
        { horaInicioEstimada: 'asc' }
      ]
    });
  }

  /**
   * Elimina o cancela una asignación.
   * @param {string} asignacionId
   */
  static async eliminarAsignacion(asignacionId) {
    const asignacion = await prisma.asignacionActividad.findUnique({
      where: { id: asignacionId }
    });

    if (!asignacion) {
      throw new AppError('Asignación no encontrada', 404);
    }

    return await prisma.asignacionActividad.delete({
      where: { id: asignacionId }
    });
  }
}

