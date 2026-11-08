import { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportesService';

export const ReportesPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const res = await reportesService.obtenerResumen();
        setData(res.data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarReportes();
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
        Cargando indicadores de rendimiento y reportes gerenciales...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger">{errorMsg}</div>
      </div>
    );
  }

  const { metricasClave, reportePorConjunto, reportePorOperario } = data || {};

  return (
    <div className="container-fluid px-4 my-4">
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold text-brand-dark mb-1">
            <i className="bi bi-graph-up-arrow text-primary me-2"></i>
            Reportes e Indicadores de Rendimiento
          </h1>
          <p className="text-secondary small mb-0">
            Consolidado general de actividades ejecutadas, horas de permanencia y control por conjunto residencial.
          </p>
        </div>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-dashboard p-3 bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary-subtle text-primary rounded-3 fs-3">
                <i className="bi bi-list-check"></i>
              </div>
              <div>
                <span className="small text-secondary d-block">Total Actividades</span>
                <span className="h4 fw-bold text-brand-dark">{metricasClave?.totalAsignaciones || 0}</span>
                <div className="text-muted small">Programadas</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-dashboard p-3 bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success-subtle text-success rounded-3 fs-3">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <span className="small text-secondary d-block">Aprobadas</span>
                <span className="h4 fw-bold text-success">{metricasClave?.aprobadas || 0}</span>
                <div className="text-muted small">Tasa: {metricasClave?.tasaAprobacionPorcentaje}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-dashboard p-3 bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-danger-subtle text-danger rounded-3 fs-3">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div>
                <span className="small text-secondary d-block">Rechazadas</span>
                <span className="h4 fw-bold text-danger">{metricasClave?.rechazadas || 0}</span>
                <div className="text-muted small">Por corregir</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-dashboard p-3 bg-white h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 fs-3">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <span className="small text-secondary d-block">Horas Trabajadas</span>
                <span className="h4 fw-bold text-brand-dark">{metricasClave?.totalHorasPermanencia || 0} h</span>
                <div className="text-muted small">En campo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas Detalladas */}
      <div className="row g-4">
        {/* Tabla: Rendimiento por Conjunto Residencial */}
        <div className="col-12 col-lg-6">
          <div className="card card-dashboard bg-white overflow-hidden h-100">
            <div className="p-3 border-bottom bg-light">
              <h2 className="h6 fw-bold text-brand-dark m-0">
                <i className="bi bi-buildings me-2 text-primary"></i> Actividades por Conjunto Residencial
              </h2>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Conjunto Residencial</th>
                    <th>Ciudad</th>
                    <th className="text-center">Actividades</th>
                    <th className="text-center">Asistencias</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePorConjunto?.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold text-brand-dark">{c.nombre}</td>
                      <td className="text-secondary small">{c.ciudad}</td>
                      <td className="text-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {c.totalActividades}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {c.totalAsistencias}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tabla: Rendimiento por Operario */}
        <div className="col-12 col-lg-6">
          <div className="card card-dashboard bg-white overflow-hidden h-100">
            <div className="p-3 border-bottom bg-light">
              <h2 className="h6 fw-bold text-brand-dark m-0">
                <i className="bi bi-person-badge me-2 text-success"></i> Seguimiento por Operario
              </h2>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Código</th>
                    <th>Operario</th>
                    <th className="text-center">Asignadas</th>
                    <th className="text-center">Jornadas</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePorOperario?.map((op) => (
                    <tr key={op.id}>
                      <td>
                        <span className="badge bg-light text-dark border">{op.codigo}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-brand-dark">{op.nombreCompleto}</div>
                        <small className="text-muted">{op.email}</small>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {op.actividadesAsignadas}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                          {op.diasAsistencia}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
