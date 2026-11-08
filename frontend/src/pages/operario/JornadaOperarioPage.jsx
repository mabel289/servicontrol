import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { programacionService } from '../../services/programacionService';
import { offlineQueue } from '../../offline/offlineQueue';
import { compressImage } from '../../offline/imageCompressor';
import { apiClient } from '../../services/apiClient';
import { generateUUID } from '../../utils/uuid';

export const JornadaOperarioPage = () => {
  const { user } = useAuth();
  const { isOnline, pendingCount, isSyncing, sincronizarAhora, actualizarContadorPendientes } = useConnectivity();

  const [actividades, setActividades] = useState([]);
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [fotosLocales, setFotosLocales] = useState({}); // { [asignacionId]: { ANTES: dataUrl, DURANTE: dataUrl, DESPUES: dataUrl } }

  // Cargar datos (Estrategia Offline-First: primero IndexedDB, luego red si está online)
  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Cargar desde IndexedDB inmediatamente
      const actividadesLocales = await offlineQueue.obtenerActividadesLocal();
      const asistenciaLocal = await offlineQueue.obtenerAsistenciaHoyLocal();

      if (actividadesLocales && actividadesLocales.length > 0) {
        setActividades(actividadesLocales);
      }
      if (asistenciaLocal) {
        setAsistenciaHoy(asistenciaLocal);
      }

      // 2. Si hay conexión a internet, sincronizar con el servidor y actualizar IndexedDB
      if (navigator.onLine) {
        try {
          const remoteActs = await programacionService.misActividades();
          setActividades(remoteActs);
          await offlineQueue.guardarActividadesLocal(remoteActs);

          const resAsistencia = await apiClient.get('/asistencia/hoy');
          if (resAsistencia.data?.asistencia) {
            setAsistenciaHoy(resAsistencia.data.asistencia);
            await offlineQueue.guardarAsistenciaHoyLocal(resAsistencia.data.asistencia);
          }
          setMensaje({ tipo: 'success', texto: `Sincronizado: ${remoteActs.length} actividades asignadas.` });
        } catch (netErr) {
          console.warn('Operando con datos cacheados en IndexedDB:', netErr.message);
          setMensaje({ tipo: 'warning', texto: 'Aviso al consultar servidor: ' + netErr.message });
        }
      }
    } catch (err) {
      console.error('Error cargando jornada:', err);
    } finally {
      setLoading(false);
      actualizarContadorPendientes();
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- ASISTENCIA: ENTRADA ---
  const handleRegistrarEntrada = async (centroTrabajoId) => {
    const syncUuid = generateUUID();
    const hoyStr = new Date().toISOString().split('T')[0];
    const ahoraIso = new Date().toISOString();

    const registro = {
      tipo: 'ENTRADA',
      centroTrabajoId,
      fecha: hoyStr,
      horaEntrada: ahoraIso,
      syncUuid,
      estadoSync: 'PENDIENTE'
    };

    // 1. Guardar en cola local IndexedDB siempre
    await offlineQueue.encolarAsistencia(registro);
    await offlineQueue.guardarAsistenciaHoyLocal(registro);
    setAsistenciaHoy(registro);
    await actualizarContadorPendientes();

    // 2. Si está en línea, enviar al servidor de inmediato
    if (navigator.onLine) {
      try {
        const res = await apiClient.post('/asistencia/entrada', registro);
        setAsistenciaHoy(res.data.asistencia);
        await offlineQueue.guardarAsistenciaHoyLocal(res.data.asistencia);
        await offlineQueue.limpiarConfirmados([syncUuid]);
        await actualizarContadorPendientes();
        setMensaje({ tipo: 'success', texto: 'Entrada registrada y sincronizada con el servidor' });
      } catch (err) {
        setMensaje({ tipo: 'info', texto: 'Entrada guardada en el dispositivo (se sincronizará al salir del conjunto)' });
      }
    } else {
      setMensaje({ tipo: 'warning', texto: 'Modo sin internet: Entrada guardada en el celular' });
    }
  };

  // --- ASISTENCIA: SALIDA ---
  const handleRegistrarSalida = async () => {
    if (!asistenciaHoy) return;

    const ahoraIso = new Date().toISOString();
    const syncUuidSalida = generateUUID();

    const salidaData = {
      tipo: 'SALIDA',
      asistenciaId: asistenciaHoy.id,
      syncUuid: asistenciaHoy.syncUuid || syncUuidSalida,
      horaSalida: ahoraIso
    };

    const actualizado = {
      ...asistenciaHoy,
      horaSalida: ahoraIso
    };

    // Guardar en IndexedDB
    await offlineQueue.encolarAsistencia(salidaData);
    await offlineQueue.guardarAsistenciaHoyLocal(actualizado);
    setAsistenciaHoy(actualizado);
    await actualizarContadorPendientes();

    if (navigator.onLine) {
      try {
        const res = await apiClient.post('/asistencia/salida', salidaData);
        setAsistenciaHoy(res.data.asistencia);
        await offlineQueue.guardarAsistenciaHoyLocal(res.data.asistencia);
        await offlineQueue.limpiarConfirmados([salidaData.syncUuid]);
        await actualizarContadorPendientes();
        setMensaje({ tipo: 'success', texto: 'Salida registrada y sincronizada exitosamente' });
      } catch (err) {
        setMensaje({ tipo: 'info', texto: 'Salida guardada en el dispositivo (pendiente de sincronización)' });
      }
    } else {
      setMensaje({ tipo: 'warning', texto: 'Modo sin internet: Salida guardada en el celular' });
    }
  };

  // --- EJECUCIÓN: INICIAR ACTIVIDAD ---
  const handleIniciarActividad = async (asigId) => {
    try {
      const syncUuid = generateUUID();
      const ahoraIso = new Date().toISOString();

      const datos = {
        accion: 'INICIAR',
        asignacionId: asigId,
        horaInicioReal: ahoraIso,
        syncUuid
      };

      // Actualizar estado localmente en IndexedDB
      await offlineQueue.encolarEjecucion(datos);
      await offlineQueue.actualizarActividadLocal(asigId, { estado: 'EN_PROCESO' });
      setActividades(prev => prev.map(a => a.id === asigId ? { ...a, estado: 'EN_PROCESO' } : a));
      await actualizarContadorPendientes();

      if (navigator.onLine) {
        try {
          await apiClient.post('/ejecucion/iniciar', datos);
          await offlineQueue.limpiarConfirmados([syncUuid]);
          await actualizarContadorPendientes();
          setMensaje({ tipo: 'success', texto: '¡Actividad iniciada con éxito! Ya puedes tomar las fotos de evidencia.' });
        } catch (err) {
          console.warn('Inicio encolado offline:', err.message);
          setMensaje({ tipo: 'info', texto: 'Actividad iniciada en modo local (se sincronizará al haber conexión).' });
        }
      } else {
        setMensaje({ tipo: 'warning', texto: 'Actividad iniciada en el teléfono (modo sin internet).' });
      }
    } catch (error) {
      console.error('Error al iniciar:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al iniciar actividad: ' + error.message });
    }
  };

  // --- EVIDENCIAS: CAPTURA Y COMPRESIÓN DE FOTO ---
  const handleCapturarFoto = async (asigId, tipoFoto, file) => {
    if (!file) return;

    try {
      // Compresión en el navegador con Canvas API
      const comprimida = await compressImage(file, 1280, 0.7);
      const syncUuid = generateUUID();

      // Guardar previsualización en el estado
      setFotosLocales(prev => ({
        ...prev,
        [asigId]: {
          ...(prev[asigId] || {}),
          [tipoFoto]: {
            dataUrl: comprimida.dataUrl,
            originalSize: Math.round(comprimida.originalSize / 1024),
            compressedSize: Math.round(comprimida.compressedSize / 1024)
          }
        }
      }));

      // Encolar en IndexedDB
      await offlineQueue.encolarEvidencia({
        syncUuid,
        asignacionId: asigId,
        ejecucionId: asigId, // Asociado
        tipoEvidencia: tipoFoto,
        blob: comprimida.blob,
        fechaCaptura: new Date().toISOString()
      });

      await actualizarContadorPendientes();

      // Si hay conexión, subir de inmediato al servidor
      if (navigator.onLine) {
        try {
          const formData = new FormData();
          formData.append('foto', comprimida.blob, `${tipoFoto}_${Date.now()}.jpg`);
          formData.append('ejecucionId', asigId);
          formData.append('tipoEvidencia', tipoFoto);
          formData.append('fechaCaptura', new Date().toISOString());
          formData.append('syncUuid', syncUuid);

          await apiClient.post('/evidencias', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          await offlineQueue.limpiarConfirmados([], [syncUuid]);
          await actualizarContadorPendientes();

          setMensaje({
            tipo: 'success',
            texto: `Foto del ${tipoFoto} subida y sincronizada con éxito (-${Math.round((1 - comprimida.compressedSize / comprimida.originalSize) * 100)}% de peso)`
          });
        } catch (uploadErr) {
          console.warn('Subida encolada en IndexedDB:', uploadErr.message);
          setMensaje({
            tipo: 'info',
            texto: `Foto del ${tipoFoto} guardada en el celular (se subirá al sincronizar)`
          });
        }
      } else {
        setMensaje({
          tipo: 'warning',
          texto: `Foto del ${tipoFoto} guardada en el celular (modo sin conexión)`
        });
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: 'Error al procesar fotografía: ' + err.message });
    }
  };

  // --- EJECUCIÓN: FINALIZAR ACTIVIDAD ---
  const handleFinalizarActividad = async (asigId, observaciones) => {
    const syncUuid = generateUUID();
    const ahoraIso = new Date().toISOString();

    const datos = {
      accion: 'FINALIZAR',
      asignacionId: asigId,
      horaFinReal: ahoraIso,
      observacionesOperario: observaciones || 'Trabajo terminado por operario',
      syncUuid
    };

    // Actualizar estado en IndexedDB a PENDIENTE_REVISION
    await offlineQueue.encolarEjecucion(datos);
    await offlineQueue.actualizarActividadLocal(asigId, { estado: 'PENDIENTE_REVISION' });
    setActividades(prev => prev.map(a => a.id === asigId ? { ...a, estado: 'PENDIENTE_REVISION' } : a));
    await actualizarContadorPendientes();

    if (navigator.onLine) {
      try {
        await apiClient.post('/ejecucion/finalizar', datos);
        await offlineQueue.limpiarConfirmados([syncUuid]);
        await actualizarContadorPendientes();
        // Sincronizar de inmediato cualquier foto o evidencia que haya quedado en cola
        await sincronizarAhora();
        setMensaje({ tipo: 'success', texto: '¡Actividad finalizada y evidencias enviadas a revisión del supervisor!' });
      } catch (err) {
        console.warn('Finalización encolada offline:', err.message);
        setMensaje({ tipo: 'info', texto: 'Actividad finalizada en modo offline (pendiente de sincronización)' });
      }
    } else {
      setMensaje({ tipo: 'warning', texto: 'Modo sin internet: Actividad finalizada y guardada en el teléfono' });
    }
  };

  return (
    <div className="container-fluid px-3 my-3" style={{ maxWidth: '640px' }}>
      {/* BARRA DE ESTADO DE CONEXIÓN Y COLA OFFLINE */}
      <div className="card card-dashboard p-3 bg-white mb-2">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge rounded-pill ${isOnline ? 'bg-success' : 'bg-warning text-dark'}`}>
                <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
                {isOnline ? 'Conectado a Internet' : 'Sin Conexión (Modo Offline)'}
              </span>
            </div>
            <small className="text-secondary d-block mt-1">
              Sesión activa: <strong className="text-dark">{user?.nombres} {user?.apellidos}</strong> ({user?.operario?.codigoInstitucional || 'OP-101'})
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={cargarDatos}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              title="Refrescar asignaciones del servidor"
            >
              <i className="bi bi-arrow-clockwise"></i>
              <span>Actualizar</span>
            </button>

            <button
              onClick={sincronizarAhora}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Sincronizar</span>
                  {pendingCount > 0 && (
                    <span className="badge bg-danger">{pendingCount}</span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENSAJES DE ESTADO */}
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show small py-2 mb-3`} role="alert">
          <div>{mensaje.texto}</div>
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      {/* SECCIÓN 1: ASISTENCIA (ENTRADA Y SALIDA) */}
      <div className="card card-dashboard p-3 bg-white mb-3 border-top border-4 border-primary">
        <h2 className="h6 fw-bold text-brand-dark mb-2 d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-primary"></i> Control de Asistencia al Conjunto
        </h2>

        {!asistenciaHoy?.horaEntrada ? (
          <div>
            <p className="small text-secondary mb-3">
              Al llegar al conjunto residencial, presiona el botón para registrar tu hora de entrada:
            </p>
            {actividades.length > 0 && (
              <button
                onClick={() => handleRegistrarEntrada(actividades[0].centroTrabajoId)}
                className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-box-arrow-in-right"></i> Marcar Entrada
              </button>
            )}
          </div>
        ) : !asistenciaHoy?.horaSalida ? (
          <div>
            <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-1"></i> Entrada marcada a las:
              </span>
              <strong>{new Date(asistenciaHoy.horaEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>

            <button
              onClick={handleRegistrarSalida}
              className="btn btn-danger w-100 py-3 fw-bold fs-5 shadow-sm d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-box-arrow-right"></i> Marcar Salida del Conjunto
            </button>
          </div>
        ) : (
          <div className="alert alert-secondary py-2 px-3 small mb-0">
            <i className="bi bi-check2-all text-success me-1"></i>
            Jornada finalizada hoy. Entrada: {new Date(asistenciaHoy.horaEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Salida: {new Date(asistenciaHoy.horaSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: MIS ACTIVIDADES Y EVIDENCIAS FOTOGRÁFICAS */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h6 fw-bold text-brand-dark m-0 d-flex align-items-center gap-2">
          <i className="bi bi-list-task text-primary"></i> Mis Actividades Asignadas
        </h2>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
          {actividades.length} {actividades.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-4 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          Cargando asignaciones...
        </div>
      ) : actividades.length === 0 ? (
        <div className="card card-dashboard p-4 bg-white text-center text-secondary small">
          No tienes actividades programadas para hoy. Consulta con tu supervisor.
        </div>
      ) : (
        actividades.map((act) => {
          const fotos = fotosLocales[act.id] || {};
          const isEnProceso = act.estado === 'EN_PROCESO';
          const isPendienteRevision = act.estado === 'PENDIENTE_REVISION';
          const isAprobada = act.estado === 'APROBADA';

          return (
            <div key={act.id} className="card card-dashboard p-3 bg-white mb-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <h3 className="h6 fw-bold text-brand-dark m-0">{act.tipoActividad.nombre}</h3>
                  <small className="text-muted d-block">
                    <i className="bi bi-building me-1"></i> {act.centroTrabajo.nombre}
                  </small>
                </div>
                <span className={`badge ${
                  isAprobada ? 'bg-success' : isPendienteRevision ? 'bg-warning text-dark' : isEnProceso ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {act.estado}
                </span>
              </div>

              <div className="small text-secondary mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <span className="badge bg-light text-dark border">
                    <i className="bi bi-calendar-event me-1 text-primary"></i>
                    {new Date(act.fecha).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'short' })}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary border">
                    <i className="bi bi-clock me-1"></i> {act.horaInicioEstimada} - {act.horaFinEstimada}
                  </span>
                </div>
                {act.instrucciones && (
                  <div className="mt-1 p-2 bg-light rounded text-dark">
                    <strong>Instrucción:</strong> {act.instrucciones}
                  </div>
                )}
              </div>

              {/* BOTÓN INICIAR ACTIVIDAD */}
              {act.estado === 'PROGRAMADA' && (
                <button
                  onClick={() => handleIniciarActividad(act.id)}
                  className="btn btn-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-play-circle-fill"></i> Iniciar Actividad
                </button>
              )}

              {/* SECCIÓN DE FOTOGRAFÍAS (ANTES, DURANTE, DESPUÉS) */}
              {(isEnProceso || isPendienteRevision || isAprobada) && (
                <div className="border-top pt-3 mt-2">
                  <span className="small fw-bold text-brand-dark d-block mb-2">
                    <i className="bi bi-camera me-1"></i> Evidencias Fotográficas Obligatorias:
                  </span>

                  <div className="row g-2 mb-3">
                    {/* FOTO ANTES */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light h-100 d-flex flex-column justify-content-between">
                        <span className="badge bg-secondary mb-1">1. ANTES</span>
                        {fotos.ANTES ? (
                          <div className="position-relative">
                            <img src={fotos.ANTES.dataUrl} alt="Antes" className="img-fluid rounded mb-1" style={{ maxHeight: '70px', objectFit: 'cover' }} />
                            <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>{fotos.ANTES.compressedSize} KB</small>
                          </div>
                        ) : (
                          <div className="py-2 text-muted">
                            <i className="bi bi-camera fs-3 d-block"></i>
                          </div>
                        )}
                        {!isPendienteRevision && !isAprobada && (
                          <label className="btn btn-outline-primary btn-sm py-1 px-1 w-100 mt-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-camera me-1"></i> Capturar
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="d-none"
                              onChange={(e) => handleCapturarFoto(act.id, 'ANTES', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* FOTO DURANTE */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light h-100 d-flex flex-column justify-content-between">
                        <span className="badge bg-secondary mb-1">2. DURANTE</span>
                        {fotos.DURANTE ? (
                          <div className="position-relative">
                            <img src={fotos.DURANTE.dataUrl} alt="Durante" className="img-fluid rounded mb-1" style={{ maxHeight: '70px', objectFit: 'cover' }} />
                            <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>{fotos.DURANTE.compressedSize} KB</small>
                          </div>
                        ) : (
                          <div className="py-2 text-muted">
                            <i className="bi bi-camera fs-3 d-block"></i>
                          </div>
                        )}
                        {!isPendienteRevision && !isAprobada && (
                          <label className="btn btn-outline-primary btn-sm py-1 px-1 w-100 mt-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-camera me-1"></i> Capturar
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="d-none"
                              onChange={(e) => handleCapturarFoto(act.id, 'DURANTE', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* FOTO DESPUÉS */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light h-100 d-flex flex-column justify-content-between">
                        <span className="badge bg-secondary mb-1">3. DESPUÉS</span>
                        {fotos.DESPUES ? (
                          <div className="position-relative">
                            <img src={fotos.DESPUES.dataUrl} alt="Después" className="img-fluid rounded mb-1" style={{ maxHeight: '70px', objectFit: 'cover' }} />
                            <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>{fotos.DESPUES.compressedSize} KB</small>
                          </div>
                        ) : (
                          <div className="py-2 text-muted">
                            <i className="bi bi-camera fs-3 d-block"></i>
                          </div>
                        )}
                        {!isPendienteRevision && !isAprobada && (
                          <label className="btn btn-outline-primary btn-sm py-1 px-1 w-100 mt-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-camera me-1"></i> Capturar
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="d-none"
                              onChange={(e) => handleCapturarFoto(act.id, 'DESPUES', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTÓN FINALIZAR ACTIVIDAD */}
                  {isEnProceso && (
                    <button
                      onClick={() => handleFinalizarActividad(act.id, 'Actividad completada satisfactoriamente')}
                      className="btn btn-success w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    >
                      <i className="bi bi-check-circle-fill"></i> Finalizar y Enviar a Supervisión
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

