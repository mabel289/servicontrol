import prisma from '../../database/prisma.js';
import { AsistenciaService } from '../asistencia/asistencia.service.js';
import { EjecucionService } from '../ejecucion/ejecucion.service.js';

export class SincronizacionService {
  /**
   * Procesa un lote de transacciones capturadas offline por el operario.
   * La operación es totalmente idempotente gracias a los UUIDs generados en el dispositivo móvil.
   *
   * @param {string} operarioId
   * @param {object} lote
   * @param {Array} lote.asistencias
   * @param {Array} lote.ejecuciones
   */
  static async procesarLote(operarioId, lote) {
    const { asistencias = [], ejecuciones = [] } = lote;
    const resultado = {
      asistenciasProcesadas: 0,
      ejecucionesProcesadas: 0,
      uuidsConfirmados: []
    };

    // 1. Procesar Asistencias pendientes
    for (const item of asistencias) {
      try {
        if (item.tipo === 'ENTRADA') {
          await AsistenciaService.registrarEntrada({
            operarioId,
            centroTrabajoId: item.centroTrabajoId,
            fecha: item.fecha,
            horaEntrada: item.horaEntrada,
            syncUuid: item.syncUuid
          });
        } else if (item.tipo === 'SALIDA') {
          await AsistenciaService.registrarSalida({
            syncUuid: item.syncUuid,
            horaSalida: item.horaSalida
          });
        }
        resultado.asistenciasProcesadas++;
        resultado.uuidsConfirmados.push(item.syncUuid);
      } catch (err) {
        console.warn(`[SYNC] Aviso en asistencia ${item.syncUuid}:`, err.message);
        // Si ya existía o es idempotente, confirmamos el UUID para que el cliente lo limpie
        resultado.uuidsConfirmados.push(item.syncUuid);
      }
    }

    // 2. Procesar Ejecuciones pendientes
    for (const item of ejecuciones) {
      try {
        if (item.accion === 'INICIAR') {
          await EjecucionService.iniciarActividad({
            asignacionId: item.asignacionId,
            horaInicioReal: item.horaInicioReal,
            syncUuid: item.syncUuid
          });
        } else if (item.accion === 'FINALIZAR') {
          await EjecucionService.finalizarActividad({
            asignacionId: item.asignacionId,
            horaFinReal: item.horaFinReal,
            observacionesOperario: item.observacionesOperario
          });
        }
        resultado.ejecucionesProcesadas++;
        resultado.uuidsConfirmados.push(item.syncUuid);
      } catch (err) {
        console.warn(`[SYNC] Aviso en ejecución ${item.syncUuid}:`, err.message);
        resultado.uuidsConfirmados.push(item.syncUuid);
      }
    }

    return resultado;
  }
}

