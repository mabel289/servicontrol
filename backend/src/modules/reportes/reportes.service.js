import prisma from '../../database/prisma.js';
import { EstadoActividad } from '@prisma/client';

export class ReportesService {
  /**
   * Genera el reporte ejecutivo integral de operaciones para la gerencia.
   */
  static async obtenerResumenGeneral() {
    // 1. Contadores de actividades por estado
    const [totalAsignaciones, programadas, enProceso, pendientes, aprobadas, rechazadas] = await Promise.all([
      prisma.asignacionActividad.count(),
      prisma.asignacionActividad.count({ where: { estado: EstadoActividad.PROGRAMADA } }),
      prisma.asignacionActividad.count({ where: { estado: EstadoActividad.EN_PROCESO } }),
      prisma.asignacionActividad.count({ where: { estado: EstadoActividad.PENDIENTE_REVISION } }),
      prisma.asignacionActividad.count({ where: { estado: EstadoActividad.APROBADA } }),
      prisma.asignacionActividad.count({ where: { estado: EstadoActividad.RECHAZADA } })
    ]);

    const evaluadas = aprobadas + rechazadas;
    const tasaAprobacion = evaluadas > 0 ? Math.round((aprobadas / evaluadas) * 100) : 100;

    // 2. Métrica de Asistencia y Permanencia
    const asistencias = await prisma.asistencia.findMany({
      select: { minutosPermanencia: true, centroTrabajoId: true, operarioId: true }
    });

    const totalMinutos = asistencias.reduce((acc, curr) => acc + (curr.minutosPermanencia || 0), 0);
    const totalHoras = Math.round((totalMinutos / 60) * 10) / 10;

    // 3. Actividades agrupadas por Conjunto Residencial
    const centros = await prisma.centroTrabajo.findMany({
      include: {
        _count: {
          select: { asignaciones: true, asistencias: true }
        }
      }
    });

    const reportePorConjunto = centros.map(c => ({
      id: c.id,
      nombre: c.nombre,
      ciudad: c.ciudad,
      totalActividades: c._count.asignaciones,
      totalAsistencias: c._count.asistencias
    }));

    // 4. Rendimiento por Operario
    const operarios = await prisma.operario.findMany({
      include: {
        usuario: {
          select: { nombres: true, apellidos: true, email: true }
        },
        _count: {
          select: { asignaciones: true, asistencias: true }
        }
      }
    });

    const reportePorOperario = operarios.map(op => ({
      id: op.id,
      codigo: op.codigoInstitucional,
      nombreCompleto: `${op.usuario.nombres} ${op.usuario.apellidos}`,
      email: op.usuario.email,
      actividadesAsignadas: op._count.asignaciones,
      diasAsistencia: op._count.asistencias
    }));

    return {
      metricasClave: {
        totalAsignaciones,
        programadas,
        enProceso,
        pendientes,
        aprobadas,
        rechazadas,
        tasaAprobacionPorcentaje: tasaAprobacion,
        totalHorasPermanencia: totalHoras,
        totalAsistencias: asistencias.length
      },
      reportePorConjunto,
      reportePorOperario
    };
  }
}
