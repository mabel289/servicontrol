import { openDB } from 'idb';

const DB_NAME = 'servicontrol_offline_db';
const DB_VERSION = 1;

/**
 * Inicializa y retorna la instancia de base de datos IndexedDB local
 * para funcionamiento offline en dispositivos móviles de operarios.
 */
export const getOfflineDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Almacén de programación semanal descargada
      if (!db.objectStoreNames.contains('actividades')) {
        db.createObjectStore('actividades', { keyPath: 'id' });
      }

      // Almacén para registro de asistencia de hoy
      if (!db.objectStoreNames.contains('asistencia_hoy')) {
        db.createObjectStore('asistencia_hoy', { keyPath: 'id' });
      }

      // Cola de asistencias pendientes de sincronizar (Entradas y Salidas)
      if (!db.objectStoreNames.contains('asistencias_cola')) {
        db.createObjectStore('asistencias_cola', { keyPath: 'syncUuid' });
      }

      // Cola de ejecuciones pendientes de sincronizar (Inicios y Finalizaciones)
      if (!db.objectStoreNames.contains('ejecuciones_cola')) {
        db.createObjectStore('ejecuciones_cola', { keyPath: 'syncUuid' });
      }

      // Cola de fotografías tomadas en campo pendientes de subida
      if (!db.objectStoreNames.contains('evidencias_cola')) {
        db.createObjectStore('evidencias_cola', { keyPath: 'syncUuid' });
      }
    }
  });
};

