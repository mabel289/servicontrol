import { getOfflineDB } from './db';

export const offlineQueue = {
  // --- ACTIVIDADES PROGRAMADAS ---
  async guardarActividadesLocal(actividades) {
    const db = await getOfflineDB();
    const tx = db.transaction('actividades', 'readwrite');
    await tx.store.clear(); // Limpiar previas para asegurar sincronía exacta con el servidor
    for (const act of actividades) {
      await tx.store.put(act);
    }
    await tx.done;
  },

  async obtenerActividadesLocal() {
    const db = await getOfflineDB();
    return await db.getAll('actividades');
  },

  async actualizarActividadLocal(id, cambios) {
    const db = await getOfflineDB();
    const existente = await db.get('actividades', id);
    if (existente) {
      const actualizado = { ...existente, ...cambios };
      await db.put('actividades', actualizado);
      return actualizado;
    }
    return null;
  },

  // --- ASISTENCIA DE HOY ---
  async guardarAsistenciaHoyLocal(asistencia) {
    const db = await getOfflineDB();
    if (asistencia) {
      await db.put('asistencia_hoy', { id: 'asistencia_actual', ...asistencia });
    } else {
      await db.clear('asistencia_hoy');
    }
  },

  async obtenerAsistenciaHoyLocal() {
    const db = await getOfflineDB();
    return await db.get('asistencia_hoy', 'asistencia_actual');
  },

  // --- ENCOLAR TRANSACCIONES OFFLINE ---
  async encolarAsistencia(item) {
    const db = await getOfflineDB();
    await db.put('asistencias_cola', item);
  },

  async encolarEjecucion(item) {
    const db = await getOfflineDB();
    await db.put('ejecuciones_cola', item);
  },

  async encolarEvidencia(item) {
    const db = await getOfflineDB();
    await db.put('evidencias_cola', item);
  },

  // --- OBTENER ITEMS PENDIENTES ---
  async obtenerColasPendientes() {
    const db = await getOfflineDB();
    const asistencias = await db.getAll('asistencias_cola');
    const ejecuciones = await db.getAll('ejecuciones_cola');
    const evidencias = await db.getAll('evidencias_cola');
    return { asistencias, ejecuciones, evidencias };
  },

  async contarPendientes() {
    const db = await getOfflineDB();
    const c1 = await db.count('asistencias_cola');
    const c2 = await db.count('ejecuciones_cola');
    const c3 = await db.count('evidencias_cola');
    return c1 + c2 + c3;
  },

  // --- LIMPIEZA TRAS CONFIRMACIÓN DEL SERVIDOR ---
  async limpiarConfirmados(uuidsConfirmados = [], evidenciasUuids = []) {
    const db = await getOfflineDB();
    
    // Eliminar asistencias confirmadas
    for (const uuid of uuidsConfirmados) {
      await db.delete('asistencias_cola', uuid);
      await db.delete('ejecuciones_cola', uuid);
    }

    // Eliminar evidencias subidas
    for (const uuid of evidenciasUuids) {
      await db.delete('evidencias_cola', uuid);
    }
  }
};

