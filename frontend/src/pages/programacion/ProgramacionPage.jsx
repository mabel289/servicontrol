import { useState, useEffect } from 'react';
import { programacionService } from '../../services/programacionService';
import { centrosService } from '../../services/centrosService';
import { operariosService } from '../../services/operariosService';

export const ProgramacionPage = () => {
  const [programaciones, setProgramaciones] = useState([]);
  const [progSeleccionada, setProgSeleccionada] = useState(null);
  const [centros, setCentros] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [tiposActividad, setTiposActividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNewProgModal, setShowNewProgModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
  const [mailResults, setMailResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Formulario de asignación
  const [formData, setFormData] = useState({
    centroTrabajoId: '',
    operarioId: '',
    tipoActividadId: '',
    fecha: '',
    horaInicioEstimada: '08:00',
    horaFinEstimada: '12:00',
    instrucciones: ''
  });

  // Formulario nueva programación semanal
  const [newProgData, setNewProgData] = useState({
    semana: '2026-W47',
    fechaInicio: '2026-11-16',
    fechaFin: '2026-11-20',
    observaciones: 'Mantenimiento preventivo semanal'
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [listProgs, listCentros, listOps, listTipos] = await Promise.all([
        programacionService.listar(),
        centrosService.listar(true),
        operariosService.listar(),
        programacionService.listarTiposActividad()
      ]);

      setProgramaciones(listProgs);
      setCentros(listCentros);
      setOperarios(listOps);
      setTiposActividad(listTipos);

      if (listProgs.length > 0) {
        const detalle = await programacionService.obtenerPorId(listProgs[0].id);
        setProgSeleccionada(detalle);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const seleccionarProgramacion = async (id) => {
    try {
      setLoading(true);
      const detalle = await programacionService.obtenerPorId(id);
      setProgSeleccionada(detalle);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearProgramacion = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await programacionService.crear(newProgData);
      setSuccessMsg(`Programación ${newProgData.semana} creada exitosamente.`);
      setShowNewProgModal(false);
      cargarDatos();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!progSeleccionada) return;

    try {
      await programacionService.asignar({
        ...formData,
        programacionId: progSeleccionada.id,
        tipoActividadId: Number(formData.tipoActividadId)
      });

      setSuccessMsg('¡Actividad programada exitosamente sin conflicto de horarios!');
      setShowModal(false);
      setFormData({
        centroTrabajoId: '',
        operarioId: '',
        tipoActividadId: '',
        fecha: '',
        horaInicioEstimada: '08:00',
        horaFinEstimada: '12:00',
        instrucciones: ''
      });

      // Recargar detalle de la programación
      const actualizado = await programacionService.obtenerPorId(progSeleccionada.id);
      setProgSeleccionada(actualizado);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEliminarAsignacion = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta asignación de actividad?')) return;
    try {
      await programacionService.eliminarAsignacion(id);
      setSuccessMsg('Asignación cancelada exitosamente.');
      const actualizado = await programacionService.obtenerPorId(progSeleccionada.id);
      setProgSeleccionada(actualizado);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleNotificarOperarios = async () => {
    if (!progSeleccionada) return;
    setSendingMail(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await programacionService.notificar(progSeleccionada.id);
      setMailResults(res.data);
      setShowMailModal(true);
      setSuccessMsg(`¡Programación semanal enviada exitosamente por correo a ${res.data.totalNotificados} operario(s)!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <div className="container-fluid px-4 my-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold text-brand-dark mb-1">
            <i className="bi bi-calendar2-week text-primary me-2"></i>
            Módulo Prioritario: Programación Semanal
          </h1>
          <p className="text-secondary small mb-0">
            Asignación de actividades a operarios en conjuntos residenciales con validación anti-solapamiento.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={handleNotificarOperarios}
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
            disabled={!progSeleccionada || sendingMail}
            title="Enviar programación al correo institucional de cada operario"
          >
            {sendingMail ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Enviando correos...
              </>
            ) : (
              <>
                <i className="bi bi-envelope-paper-fill"></i> Notificar por Correo
              </>
            )}
          </button>
          <button
            onClick={() => setShowNewProgModal(true)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-calendar-plus"></i> Nueva Semana
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              setShowModal(true);
            }}
            className="btn btn-brand-primary btn-sm d-flex align-items-center gap-1"
            disabled={!progSeleccionada}
          >
            <i className="bi bi-plus-circle"></i> Asignar Actividad
          </button>
        </div>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-4 text-danger"></i>
          <div>
            <strong>Validación de Regla de Negocio:</strong> {errorMsg}
          </div>
          <button type="button" className="btn-close" onClick={() => setErrorMsg(null)}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill fs-4 text-success"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {/* Selector de Semanas */}
      <div className="card card-dashboard p-3 bg-white mb-4">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small fw-bold text-secondary text-uppercase">
            <i className="bi bi-filter me-1"></i> Semanas Programadas:
          </span>
          {programaciones.map((p) => (
            <button
              key={p.id}
              onClick={() => seleccionarProgramacion(p.id)}
              className={`btn btn-sm ${
                progSeleccionada?.id === p.id ? 'btn-primary' : 'btn-outline-secondary'
              }`}
            >
              <strong>{p.semana}</strong> ({new Date(p.fechaInicio).toLocaleDateString()} al {new Date(p.fechaFin).toLocaleDateString()})
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Asignaciones */}
      <div className="card card-dashboard bg-white overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h2 className="h6 fw-bold text-brand-dark m-0">
            Actividades Asignadas en la Semana ({progSeleccionada?.semana || 'Sin selección'})
          </h2>
          <span className="badge bg-primary">
            {progSeleccionada?.asignaciones?.length || 0} Actividades
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th>Fecha y Horario</th>
                <th>Conjunto Residencial</th>
                <th>Operario Asignado</th>
                <th>Tipo de Actividad</th>
                <th>Instrucciones</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Cargando programación semanal...
                  </td>
                </tr>
              ) : !progSeleccionada?.asignaciones?.length ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    No hay actividades asignadas para esta semana aún. Utiliza el botón "+ Asignar Actividad".
                  </td>
                </tr>
              ) : (
                progSeleccionada.asignaciones.map((asig) => (
                  <tr key={asig.id}>
                    <td>
                      <div className="fw-semibold text-brand-dark">
                        {new Date(asig.fecha).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'short' })}
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        <i className="bi bi-clock me-1"></i>
                        {asig.horaInicioEstimada} - {asig.horaFinEstimada}
                      </span>
                    </td>
                    <td>
                      <strong>{asig.centroTrabajo.nombre}</strong>
                      <div className="small text-muted">{asig.centroTrabajo.direccion}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {asig.operario.codigoInstitucional}
                        </span>
                        <span className="fw-medium text-dark">
                          {asig.operario.usuario.nombres} {asig.operario.usuario.apellidos}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                        {asig.tipoActividad.nombre}
                      </span>
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: '200px' }}>
                      {asig.instrucciones || 'Sin instrucciones adicionales'}
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {asig.estado}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleEliminarAsignacion(asig.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Cancelar actividad"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ASIGNAR NUEVA ACTIVIDAD */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-brand-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2"></i> Asignar Actividad a Operario
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleAsignar}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Centro de Trabajo (Conjunto Residencial) *</label>
                      <select
                        className="form-select"
                        value={formData.centroTrabajoId}
                        onChange={(e) => setFormData({ ...formData, centroTrabajoId: e.target.value })}
                        required
                      >
                        <option value="">Selecciona un conjunto...</option>
                        {centros.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre} ({c.ciudad})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Operario *</label>
                      <select
                        className="form-select"
                        value={formData.operarioId}
                        onChange={(e) => setFormData({ ...formData, operarioId: e.target.value })}
                        required
                      >
                        <option value="">Selecciona un operario...</option>
                        {operarios.map((o) => (
                          <option key={o.id} value={o.id}>
                            [{o.codigoInstitucional}] {o.usuario.nombres} {o.usuario.apellidos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Tipo de Actividad *</label>
                      <select
                        className="form-select"
                        value={formData.tipoActividadId}
                        onChange={(e) => setFormData({ ...formData, tipoActividadId: e.target.value })}
                        required
                      >
                        <option value="">Selecciona tipo de actividad...</option>
                        {tiposActividad.map((t) => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Fecha de Ejecución *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Hora Inicio Estimada (HH:mm) *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.horaInicioEstimada}
                        onChange={(e) => setFormData({ ...formData, horaInicioEstimada: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Hora Fin Estimada (HH:mm) *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.horaFinEstimada}
                        onChange={(e) => setFormData({ ...formData, horaFinEstimada: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Instrucciones Específicas</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Detalles sobre químicos, zonas a intervenir o herramientas requeridas..."
                        value={formData.instrucciones}
                        onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-brand-primary btn-sm">
                    <i className="bi bi-check2-circle me-1"></i> Validar y Asignar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA SEMANA */}
      {showNewProgModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-brand-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-calendar-plus me-2"></i> Crear Programación Semanal
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewProgModal(false)}></button>
              </div>

              <form onSubmit={handleCrearProgramacion}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Código de Semana (AAAA-WSS) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProgData.semana}
                      placeholder="ej: 2026-W47"
                      onChange={(e) => setNewProgData({ ...newProgData, semana: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Fecha Inicio (Lunes) *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newProgData.fechaInicio}
                        onChange={(e) => setNewProgData({ ...newProgData, fechaInicio: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Fecha Fin (Viernes) *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newProgData.fechaFin}
                        onChange={(e) => setNewProgData({ ...newProgData, fechaFin: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold">Observaciones Generales</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={newProgData.observaciones}
                      onChange={(e) => setNewProgData({ ...newProgData, observaciones: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewProgModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Crear Semana
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CORREOS ENVIADOS */}
      {showMailModal && mailResults && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-send-check-fill me-2"></i> Programación Enviada a Operarios
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMailModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-check-circle-fill fs-4"></i>
                  <div>
                    Se despachó la notificación de la <strong>Semana {mailResults.semana}</strong> a{' '}
                    <strong>{mailResults.totalNotificados} operario(s)</strong> con su correo institucional.
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Operario</th>
                        <th>Correo Institucional</th>
                        <th>Actividades</th>
                        <th className="text-center">Vista Previa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mailResults.envios?.map((env, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{env.operario}</td>
                          <td><code>{env.email}</code></td>
                          <td>
                            <span className="badge bg-primary">{env.cantidadActividades} asignadas</span>
                          </td>
                          <td className="text-center">
                            {env.previewUrl ? (
                              <a
                                href={env.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="bi bi-eye-fill me-1"></i> Ver Correo (Ethereal)
                              </a>
                            ) : (
                              <span className="badge bg-secondary">Enviado por SMTP</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="small text-muted mt-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Para fines académicos y de sustentación, los correos son procesados vía <strong>Ethereal Mail (Nodemailer)</strong>. Haz clic en <em>"Ver Correo"</em> para visualizar el HTML interactivo exactamente como lo ve el operario en su bandeja de entrada.
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowMailModal(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

