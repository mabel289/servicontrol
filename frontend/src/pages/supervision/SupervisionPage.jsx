import { useState, useEffect } from 'react';
import { supervisionService } from '../../services/supervisionService';

export const SupervisionPage = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE_REVISION');
  const [modalRechazo, setModalRechazo] = useState(null); // id de ejecucion a rechazar
  const [observacionRechazo, setObservacionRechazo] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [fotoModal, setFotoModal] = useState(null); // URL para ver foto en grande

  const cargarActividades = async () => {
    setLoading(true);
    try {
      const data = await supervisionService.listar(filtroEstado === 'TODAS' ? null : filtroEstado);
      setActividades(data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, [filtroEstado]);

  const handleAprobar = async (id) => {
    if (!window.confirm('¿Confirmas que el trabajo presencialmente cumple con los estándares de calidad?')) return;
    try {
      await supervisionService.evaluar(id, {
        estado: 'APROBADA',
        observaciones: 'Inspección presencial conforme. Trabajo debidamente ejecutado.'
      });
      setMensaje({ tipo: 'success', texto: '¡Actividad APROBADA satisfactoriamente!' });
      cargarActividades();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleConfirmarRechazo = async (e) => {
    e.preventDefault();
    if (!observacionRechazo || observacionRechazo.trim().length < 10) {
      setMensaje({ tipo: 'danger', texto: 'Debes ingresar una observación de al menos 10 caracteres explicando el motivo del rechazo' });
      return;
    }

    try {
      await supervisionService.evaluar(modalRechazo, {
        estado: 'RECHAZADA',
        observaciones: observacionRechazo
      });
      setMensaje({ tipo: 'warning', texto: 'Actividad RECHAZADA. Se ha registrado la no conformidad.' });
      setModalRechazo(null);
      setObservacionRechazo('');
      cargarActividades();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="container-fluid px-4 my-4">
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold text-brand-dark mb-1">
            <i className="bi bi-clipboard-check text-warning me-2"></i>
            Módulo de Supervisión y Control de Calidad
          </h1>
          <p className="text-secondary small mb-0">
            Inspección presencial de labores, verificación de evidencias fotográficas y dictamen de aprobación o rechazo.
          </p>
        </div>

        {/* Filtros de Estado */}
        <div className="btn-group btn-group-sm">
          <button
            onClick={() => setFiltroEstado('PENDIENTE_REVISION')}
            className={`btn ${filtroEstado === 'PENDIENTE_REVISION' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
          >
            Pendientes de Revisión
          </button>
          <button
            onClick={() => setFiltroEstado('APROBADA')}
            className={`btn ${filtroEstado === 'APROBADA' ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setFiltroEstado('RECHAZADA')}
            className={`btn ${filtroEstado === 'RECHAZADA' ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
          >
            Rechazadas
          </button>
          <button
            onClick={() => setFiltroEstado('TODAS')}
            className={`btn ${filtroEstado === 'TODAS' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
          >
            Todas
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show small mb-4`} role="alert">
          <div>{mensaje.texto}</div>
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          Cargando inspecciones de supervisión...
        </div>
      ) : actividades.length === 0 ? (
        <div className="card card-dashboard p-5 bg-white text-center text-secondary">
          <i className="bi bi-check2-circle fs-1 text-success mb-2 d-block"></i>
          <h5>No hay actividades pendientes en esta categoría</h5>
          <p className="small mb-0">Todas las labores registradas han sido inspeccionadas o no hay registros para el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="row g-4">
          {actividades.map((act) => {
            const asig = act.asignacion;
            const op = asig.operario;
            const isPendiente = act.estado === 'PENDIENTE_REVISION';
            const isAprobada = act.estado === 'APROBADA';
            const isRechazada = act.estado === 'RECHAZADA';

            // Agrupar evidencias fotográficas por tipo
            const fotoAntes = act.evidencias.find(e => e.tipoEvidencia === 'ANTES');
            const fotoDurante = act.evidencias.find(e => e.tipoEvidencia === 'DURANTE');
            const fotoDespues = act.evidencias.find(e => e.tipoEvidencia === 'DESPUES');

            return (
              <div key={act.id} className="col-12 col-lg-6">
                <div className={`card card-dashboard bg-white h-100 p-4 border-top border-4 ${
                  isAprobada ? 'border-success' : isRechazada ? 'border-danger' : 'border-warning'
                }`}>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">
                        {asig.tipoActividad.nombre}
                      </span>
                      <h2 className="h5 fw-bold text-brand-dark mb-0">{asig.centroTrabajo.nombre}</h2>
                      <small className="text-muted">{asig.centroTrabajo.direccion} ({asig.centroTrabajo.ciudad})</small>
                    </div>

                    <span className={`badge px-2.5 py-1.5 ${
                      isAprobada ? 'bg-success' : isRechazada ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {act.estado}
                    </span>
                  </div>

                  {/* Datos del Operario y Horarios */}
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="row g-2">
                      <div className="col-12 col-sm-6">
                        <strong>Operario:</strong> {op.usuario.nombres} {op.usuario.apellidos}
                        <div className="text-muted">Código: {op.codigoInstitucional}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Horario Ejecutado:</strong>
                        <div className="text-muted">
                          Inicio: {new Date(act.horaInicioReal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {act.horaFinReal && ` | Fin: ${new Date(act.horaFinReal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                      </div>
                      {act.observacionesOperario && (
                        <div className="col-12 border-top pt-2 mt-1">
                          <strong>Nota del Operario:</strong> {act.observacionesOperario}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Galería de Evidencias Fotográficas */}
                  <h3 className="h6 fw-bold text-brand-dark mb-2">
                    <i className="bi bi-images me-1"></i> Evidencias Fotográficas:
                  </h3>
                  <div className="row g-2 mb-3">
                    {/* ANTES */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light">
                        <span className="badge bg-secondary mb-1">ANTES</span>
                        {fotoAntes ? (
                          <img
                            src={fotoAntes.urlArchivo}
                            alt="Antes"
                            className="img-fluid rounded cursor-pointer"
                            style={{ height: '90px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setFotoModal(fotoAntes.urlArchivo)}
                          />
                        ) : (
                          <div className="text-muted py-3 small">Sin foto</div>
                        )}
                      </div>
                    </div>

                    {/* DURANTE */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light">
                        <span className="badge bg-secondary mb-1">DURANTE</span>
                        {fotoDurante ? (
                          <img
                            src={fotoDurante.urlArchivo}
                            alt="Durante"
                            className="img-fluid rounded cursor-pointer"
                            style={{ height: '90px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setFotoModal(fotoDurante.urlArchivo)}
                          />
                        ) : (
                          <div className="text-muted py-3 small">Sin foto</div>
                        )}
                      </div>
                    </div>

                    {/* DESPUÉS */}
                    <div className="col-4 text-center">
                      <div className="border rounded p-2 bg-light">
                        <span className="badge bg-secondary mb-1">DESPUÉS</span>
                        {fotoDespues ? (
                          <img
                            src={fotoDespues.urlArchivo}
                            alt="Después"
                            className="img-fluid rounded cursor-pointer"
                            style={{ height: '90px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setFotoModal(fotoDespues.urlArchivo)}
                          />
                        ) : (
                          <div className="text-muted py-3 small">Sin foto</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dictamen previo o Botones de Acción */}
                  {act.revisiones?.length > 0 && (
                    <div className="alert alert-light border p-2 small mb-3">
                      <strong>Dictamen del Supervisor:</strong> {act.revisiones[0].observaciones}
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Fecha: {new Date(act.revisiones[0].fechaRevision).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {isPendiente && (
                    <div className="d-flex gap-2 mt-auto">
                      <button
                        onClick={() => handleAprobar(act.id)}
                        className="btn btn-success btn-sm flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-1"
                      >
                        <i className="bi bi-check-circle-fill"></i> Aprobar Trabajo
                      </button>
                      <button
                        onClick={() => {
                          setModalRechazo(act.id);
                          setObservacionRechazo('');
                        }}
                        className="btn btn-outline-danger btn-sm flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-1"
                      >
                        <i className="bi bi-x-circle-fill"></i> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: MOTIVO DE RECHAZO (REGLA DE NEGOCIO OBLIGATORIA) */}
      {modalRechazo && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i> Rechazar Actividad
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalRechazo(null)}></button>
              </div>

              <form onSubmit={handleConfirmarRechazo}>
                <div className="modal-body p-4">
                  <p className="small text-secondary mb-3">
                    De acuerdo con el estándar de control de calidad, es <strong>obligatorio</strong> especificar
                    el motivo de no conformidad técnica o visual para que el operario corrija el trabajo:
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Observaciones de Rechazo *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Explica detalladamente la razón (ej: 'El borde de la piscina no fue aspirado completamente y persisten manchas de pintura en el zócalo')..."
                      value={observacionRechazo}
                      onChange={(e) => setObservacionRechazo(e.target.value)}
                      required
                    ></textarea>
                    <div className="form-text small">Mínimo 10 caracteres obligatorios.</div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalRechazo(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm fw-bold">
                    Confirmar Rechazo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVISUALIZAR FOTO EN TAMAÑO REAL */}
      {fotoModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setFotoModal(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0 text-center">
              <img src={fotoModal} alt="Evidencia ampliada" className="img-fluid rounded shadow" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
              <button className="btn btn-light btn-sm mt-2 mx-auto" onClick={() => setFotoModal(null)}>Cerrar Imagen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
