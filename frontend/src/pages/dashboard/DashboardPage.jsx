import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    usuariosTotal: 0,
    centrosTotal: 0,
    loading: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (role === 'ADMINISTRADOR' || role === 'ADMINISTRATIVO') {
          const resUsuarios = await apiClient.get('/usuarios');
          setStats({
            usuariosTotal: resUsuarios.data.total,
            centrosTotal: 3, // Torres del Parque, Alameda, Portales
            loading: false
          });
        } else {
          setStats(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('Error cargando métricas:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    cargarDatos();
  }, [role]);

  return (
    <div className="container my-4">
      {/* Banner de Bienvenida */}
      <div className="card card-dashboard p-4 mb-4 bg-white border-start border-4 border-primary">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="h4 fw-bold text-brand-dark mb-1">
              Bienvenido, {user?.nombres} {user?.apellidos}
            </h1>
            <p className="text-secondary small mb-0">
              Panel de control del perfil: <strong className="text-primary">{role}</strong> | ServiControl v1.0
            </p>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
            <i className="bi bi-clock me-1"></i> Sesión Activa
          </span>
        </div>
      </div>

      {/* VISTA 1: DASHBOARD ADMINISTRADOR / ADMINISTRATIVO */}
      {(role === 'ADMINISTRADOR' || role === 'ADMINISTRATIVO') && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-dashboard p-3 bg-white h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-primary-subtle text-primary rounded-3 fs-4">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Usuarios Activos</span>
                    <span className="h4 fw-bold text-brand-dark">{stats.loading ? '...' : stats.usuariosTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-dashboard p-3 bg-white h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-success-subtle text-success rounded-3 fs-4">
                    <i className="bi bi-buildings-fill"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Centros de Trabajo</span>
                    <span className="h4 fw-bold text-brand-dark">{stats.centrosTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-dashboard p-3 bg-white h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 fs-4">
                    <i className="bi bi-calendar-check-fill"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Programaciones</span>
                    <span className="h4 fw-bold text-brand-dark">Semanal Activa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-dashboard p-3 bg-white h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-info-subtle text-info-emphasis rounded-3 fs-4">
                    <i className="bi bi-cloud-check-fill"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Sincronización</span>
                    <span className="h4 fw-bold text-brand-dark">100% Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos a Módulos del Sistema */}
          <h2 className="h5 fw-bold text-brand-dark mb-3">Módulos del Sistema</h2>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card card-dashboard p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="text-primary fs-3 mb-2">
                    <i className="bi bi-calendar-week"></i>
                  </div>
                  <h3 className="h6 fw-bold text-brand-dark">Programación Semanal</h3>
                  <p className="text-secondary small">
                    Planificación semanal de actividades por conjunto residencial, asignación de operarios y validación anti-solapamiento.
                  </p>
                </div>
                <Link to="/programacion" className="btn btn-outline-primary btn-sm mt-3 w-100">
                  <i className="bi bi-arrow-right-circle me-1"></i> Ir a Programación
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card card-dashboard p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="text-success fs-3 mb-2">
                    <i className="bi bi-person-lines-fill"></i>
                  </div>
                  <h3 className="h6 fw-bold text-brand-dark">Hojas de Vida y Operarios</h3>
                  <p className="text-secondary small">
                    Gestión de datos de operarios, números de identificación, formación técnica y certificados laborales.
                  </p>
                </div>
                <Link to="/operarios" className="btn btn-outline-success btn-sm mt-3 w-100">
                  <i className="bi bi-arrow-right-circle me-1"></i> Ver Operarios
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card card-dashboard p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="text-info fs-3 mb-2">
                    <i className="bi bi-building"></i>
                  </div>
                  <h3 className="h6 fw-bold text-brand-dark">Centros de Trabajo</h3>
                  <p className="text-secondary small">
                    Administración de conjuntos residenciales, contactos de administradores locales y ubicaciones.
                  </p>
                </div>
                <Link to="/centros-trabajo" className="btn btn-outline-info btn-sm mt-3 w-100">
                  <i className="bi bi-arrow-right-circle me-1"></i> Ver Conjuntos
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VISTA 2: DASHBOARD OPERARIO (Prioridad Móvil) */}
      {role === 'OPERARIO' && (
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card card-dashboard p-4 bg-white text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mx-auto mb-3">
                <i className="bi bi-person-badge fs-1"></i>
              </div>
              <h2 className="h4 fw-bold text-brand-dark mb-1">Jornada Laboral</h2>
              <p className="text-secondary small mb-4">
                Código Institucional: <strong>{user?.operario?.codigoInstitucional || 'OP-101'}</strong>
              </p>

              {/* Tarjeta de Asistencia */}
              <div className="p-3 bg-light rounded-3 mb-4 text-start">
                <span className="small text-secondary fw-semibold d-block mb-1">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i> Centro de Trabajo Asignado Hoy:
                </span>
                <strong className="text-brand-dark d-block mb-2">
                  Conjunto Residencial Torres del Parque
                </strong>
                <div className="d-flex gap-2">
                  <Link to="/operario/jornada" className="btn btn-brand-primary w-100 py-2.5 fw-bold">
                    <i className="bi bi-play-circle me-1"></i> Abrir Mi Jornada y Actividades
                  </Link>
                </div>
              </div>

              {/* Estado de sincronización offline */}
              <div className="alert alert-info py-2 px-3 small d-flex align-items-center justify-content-between m-0">
                <span>
                  <i className="bi bi-wifi text-success me-1"></i> Modo Conectado
                </span>
                <span className="badge bg-success">Sin pendientes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: DASHBOARD SUPERVISOR */}
      {role === 'SUPERVISOR' && (
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-dashboard p-4 bg-white h-100">
              <div className="text-warning fs-3 mb-2">
                <i className="bi bi-clipboard-check"></i>
              </div>
              <h3 className="h6 fw-bold text-brand-dark">Inspección de Trabajos</h3>
              <p className="text-secondary small">
                Revisa las fotografías de evidencias (antes, durante y después) y emite concepto de Aprobado o Rechazado.
              </p>
              <Link to="/supervision" className="btn btn-warning w-100 mt-3 text-dark fw-bold">
                <i className="bi bi-search me-1"></i> Inspeccionar Trabajos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

