import { useState, useEffect } from 'react';
import { apiClient } from './services/apiClient';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null
  });

  const checkBackendHealth = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/health');
      setHealthStatus({
        loading: false,
        connected: true,
        data: response.data,
        error: null
      });
    } catch (err) {
      setHealthStatus({
        loading: false,
        connected: false,
        data: null,
        error: err.message
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Barra superior de navegación */}
      <header className="navbar navbar-dark bg-brand-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2 fw-bold">
            <i className="bi bi-shield-check text-primary fs-4"></i>
            ServiControl
          </span>
          <span className="badge bg-brand-primary px-3 py-2 rounded-pill">
            Etapa 1: Base de Arquitectura Verificada
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container my-5 flex-grow-1">
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Tarjeta de bienvenida y presentación académica */}
            <div className="card card-dashboard p-4 mb-4 bg-white">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h1 className="h3 fw-bold text-brand-dark m-0">
                  Sistema de Gestión y Seguimiento de Servicios Locativos
                </h1>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  Taller Práctico - Ingeniería de Software Orientada a Objetos
                </span>
              </div>
              <p className="text-secondary mb-0">
                Arquitectura de <strong>Monolito Modular Organizado por Capas</strong> con frontend React + Vite, 
                backend Node.js + Express y persistencia PostgreSQL con Prisma ORM.
              </p>
            </div>

            {/* Tarjeta de estado de conexión entre Frontend y Backend */}
            <div className="card card-dashboard p-4 bg-white mb-4">
              <h2 className="h5 fw-bold text-brand-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-hdd-network text-primary"></i>
                Verificación de Comunicación Cliente - Servidor
              </h2>

              {healthStatus.loading ? (
                <div className="d-flex align-items-center gap-3 py-3 text-secondary">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <span>Consultando estado del servidor Backend (<code>/api/health</code>)...</span>
                </div>
              ) : healthStatus.connected ? (
                <div className="alert alert-success d-flex align-items-center gap-3 m-0" role="alert">
                  <i className="bi bi-check-circle-fill fs-3 text-success"></i>
                  <div className="flex-grow-1">
                    <strong className="d-block text-success-emphasis">
                      ¡Conexión establecida exitosamente con el Backend!
                    </strong>
                    <small className="text-secondary">
                      Servidor: <code>{healthStatus.data?.sistema}</code> | 
                      Versión: <code>{healthStatus.data?.version}</code> | 
                      Entorno: <code>{healthStatus.data?.entorno}</code> | 
                      Timestamp: <code>{healthStatus.data?.timestamp}</code>
                    </small>
                  </div>
                  <button 
                    onClick={checkBackendHealth} 
                    className="btn btn-sm btn-outline-success"
                    title="Actualizar verificación"
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Revalidar
                  </button>
                </div>
              ) : (
                <div className="alert alert-danger d-flex align-items-center gap-3 m-0" role="alert">
                  <i className="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
                  <div className="flex-grow-1">
                    <strong className="d-block text-danger-emphasis">
                      No se pudo conectar con el servidor Backend
                    </strong>
                    <small>{healthStatus.error}</small>
                  </div>
                  <button 
                    onClick={checkBackendHealth} 
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
                  </button>
                </div>
              )}
            </div>

            {/* Módulos priorizados y principios de diseño */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="card card-dashboard p-3 h-100 bg-white">
                  <h3 className="h6 fw-bold text-brand-dark d-flex align-items-center gap-2">
                    <i className="bi bi-calendar2-week text-primary"></i>
                    Módulo Prioritario 1: Programación Semanal
                  </h3>
                  <p className="small text-secondary m-0">
                    Asignación de operarios a centros de trabajo (conjuntos residenciales), validación de cruces de horarios e instrucciones de labor.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card card-dashboard p-3 h-100 bg-white">
                  <h3 className="h6 fw-bold text-brand-dark d-flex align-items-center gap-2">
                    <i className="bi bi-phone text-success"></i>
                    Módulo Prioritario 2: Asistencia y Evidencias Offline
                  </h3>
                  <p className="small text-secondary m-0">
                    Registro de entrada/salida, fotografías (antes/durante/después) con IndexedDB para operarios sin cobertura y sincronización resiliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-white border-top py-3 text-center text-secondary small">
        <div className="container">
          ServiControl &copy; {new Date().getFullYear()} - Sistema de Gestión de Servicios Locativos | Arquitectura Monolito Modular
        </div>
      </footer>
    </div>
  );
}

