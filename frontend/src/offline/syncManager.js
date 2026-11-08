import { offlineQueue } from './offlineQueue';
import { apiClient } from '../services/apiClient';

export const syncManager = {
  /**
   * Ejecuta el proceso de sincronización con el servidor.
   * Regla de oro: No elimina ningún registro local de IndexedDB
   * hasta recibir confirmación HTTP 200/201 del backend.
   */
  async sincronizarTodo() {
    const { asistencias, ejecuciones, evidencias } = await offlineQueue.obtenerColasPendientes();

    const resultado = {
      totalLote: asistencias.length + ejecuciones.length,
      fotosSubidas: 0,
      errores: []
    };

    // 1. Sincronizar Asistencias y Ejecuciones por Lote
    if (asistencias.length > 0 || ejecuciones.length > 0) {
      try {
        const respuesta = await apiClient.post('/sincronizacion/lote', {
          asistencias,
          ejecuciones
        });

        const uuidsConfirmados = respuesta.data?.uuidsConfirmados || [];
        await offlineQueue.limpiarConfirmados(uuidsConfirmados);
      } catch (err) {
        console.error('Error al sincronizar lote:', err);
        resultado.errores.push('Lote de actividades: ' + err.message);
      }
    }

    // 2. Sincronizar Fotografías pendientes individualmente vía Multipart/FormData
    const evidenciasSubidasUuids = [];
    for (const foto of evidencias) {
      try {
        const formData = new FormData();
        formData.append('foto', foto.blob, `${foto.tipoEvidencia}_${Date.now()}.jpg`);
        formData.append('ejecucionId', foto.ejecucionId);
        formData.append('tipoEvidencia', foto.tipoEvidencia);
        formData.append('fechaCaptura', foto.fechaCaptura);
        formData.append('syncUuid', foto.syncUuid);

        await apiClient.post('/evidencias', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        evidenciasSubidasUuids.push(foto.syncUuid);
        resultado.fotosSubidas++;
      } catch (err) {
        console.error(`Error al subir evidencia ${foto.syncUuid}:`, err);
        resultado.errores.push(`Foto ${foto.tipoEvidencia}: ` + err.message);
      }
    }

    if (evidenciasSubidasUuids.length > 0) {
      await offlineQueue.limpiarConfirmados([], evidenciasSubidasUuids);
    }

    return resultado;
  }
};
