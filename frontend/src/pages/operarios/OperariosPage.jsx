import { useState, useEffect } from 'react';
import { operariosService } from '../../services/operariosService';

export const OperariosPage = () => {
  const [operarios, setOperarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operarioSeleccionado, setOperarioSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Formulario Hoja de Vida
  const [hvData, setHvData] = useState({
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    formacionAcademica: '',
    experienciaLaboral: ''
  });

  const cargarOperarios = async () => {
    setLoading(true);
    try {
      const data = await operariosService.listar();
      setOperarios(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOperarios();
  }, []);

  const abrirHojaVida = (op) => {
    setOperarioSeleccionado(op);
    setHvData({
      numeroIdentificacion: op.hojaVida?.numeroIdentificacion || '',
      telefono: op.usuario.telefono || '',
      direccion: op.hojaVida?.direccion || '',
      formacionAcademica: op.hojaVida?.formacionAcademica || '',
      experienciaLaboral: op.hojaVida?.experienciaLaboral || ''
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleGuardarHojaVida = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await operariosService.guardarHojaVida(operarioSeleccionado.id, hvData);
      setSuccessMsg('Hoja de vida actualizada correctamente.');
      setShowModal(false);
      cargarOperarios();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="container-fluid px-4 my-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold text-brand-dark mb-1">
            <i className="bi bi-people text-primary me-2"></i>
            Hojas de Vida y Operarios
          </h1>
          <p className="text-secondary small mb-0">
            Administración del personal de campo, información de contacto, formación técnica y experiencia.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg(null)}></button>
        </div>
      )}

      <div className="card card-dashboard bg-white overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h2 className="h6 fw-bold text-brand-dark m-0">Personal de Operarios Registrado</h2>
          <span className="badge bg-success">{operarios.length} Operarios</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th>Código</th>
                <th>Nombre Completo</th>
                <th>Correo Institucional</th>
                <th>Teléfono</th>
                <th>Cédula / Identificación</th>
                <th>Estado Laboral</th>
                <th className="text-end">Hoja de Vida</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Cargando listado de operarios...
                  </td>
                </tr>
              ) : operarios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    No hay operarios registrados en el sistema.
                  </td>
                </tr>
              ) : (
                operarios.map((op) => (
                  <tr key={op.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                        {op.codigoInstitucional}
                      </span>
                    </td>
                    <td className="fw-semibold text-brand-dark">
                      {op.usuario.nombres} {op.usuario.apellidos}
                    </td>
                    <td className="text-secondary small">{op.usuario.email}</td>
                    <td className="text-secondary small">{op.usuario.telefono || 'Sin registrar'}</td>
                    <td>
                      {op.hojaVida?.numeroIdentificacion ? (
                        <span className="badge bg-light text-dark border">
                          {op.hojaVida.numeroIdentificacion}
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis">Pendiente</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${op.estadoLaboral === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                        {op.estadoLaboral}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => abrirHojaVida(op)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-file-earmark-person"></i>
                        <span>{op.hojaVida ? 'Ver / Editar' : 'Completar'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VER / EDITAR HOJA DE VIDA */}
      {showModal && operarioSeleccionado && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-brand-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Hoja de Vida: {operarioSeleccionado.usuario.nombres} {operarioSeleccionado.usuario.apellidos}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleGuardarHojaVida}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Código Institucional</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={operarioSeleccionado.codigoInstitucional}
                        disabled
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Número de Cédula / Identificación *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={hvData.numeroIdentificacion}
                        onChange={(e) => setHvData({ ...hvData, numeroIdentificacion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={hvData.telefono}
                        onChange={(e) => setHvData({ ...hvData, telefono: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Dirección de Residencia *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={hvData.direccion}
                        onChange={(e) => setHvData({ ...hvData, direccion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Formación Académica y Certificaciones Técnicas *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Cursos de alturas, manejo de sustancias químicas para piscinas, técnico en jardinería..."
                        value={hvData.formacionAcademica}
                        onChange={(e) => setHvData({ ...hvData, formacionAcademica: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Experiencia Laboral Previa *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Empresas anteriores, funciones desempeñadas y años de experiencia..."
                        value={hvData.experienciaLaboral}
                        onChange={(e) => setHvData({ ...hvData, experienciaLaboral: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                  <button type="submit" className="btn btn-brand-primary btn-sm">
                    <i className="bi bi-save me-1"></i> Guardar Hoja de Vida
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

