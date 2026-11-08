import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../offline/offlineQueue';
import { syncManager } from '../offline/syncManager';

const ConnectivityContext = createContext(null);

export const ConnectivityProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const actualizarContadorPendientes = useCallback(async () => {
    try {
      const total = await offlineQueue.contarPendientes();
      setPendingCount(total);
    } catch (err) {
      console.warn('Error al leer cola IndexedDB:', err);
    }
  }, []);

  const sincronizarAhora = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    try {
      const resultado = await syncManager.sincronizarTodo();
      setLastSyncResult(resultado);
      await actualizarContadorPendientes();
      return resultado;
    } catch (err) {
      console.error('Fallo en sincronización automática:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, actualizarContadorPendientes]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sincronización automática al recuperar conectividad (Requisito clave del taller)
      sincronizarAhora();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    actualizarContadorPendientes();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sincronizarAhora, actualizarContadorPendientes]);

  const value = {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    actualizarContadorPendientes,
    sincronizarAhora
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity debe ser utilizado dentro de un ConnectivityProvider');
  }
  return context;
};

