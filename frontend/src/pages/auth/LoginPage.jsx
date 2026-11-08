import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Helper para agilizar la sustentación académica ante el profesor
  const autocompletarCredenciales = (correo, clave) => {
    setEmail(correo);
    setPassword(clave);
    setError(null);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 bg-light">
      <div className="card card-dashboard p-4 p-md-5 bg-white" style={{ maxWidth: '460px', width: '100%' }}>
        {/* Cabecera del formulario */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
            <i className="bi bi-shield-lock-fill fs-2"></i>
          </div>
          <h2 className="h4 fw-bold text-brand-dark mb-1">Iniciar Sesión</h2>
          <p className="text-secondary small">
            ServiControl - Gestión y Seguimiento de Servicios Locativos
          </p>
        </div>

        {/* Alerta de error */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3" role="alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Correo Electrónico Institucional
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="ejemplo@servicontrol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">
              Contraseña
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-brand-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Cuentas demo para demostración académica */}
        <div className="border-top mt-4 pt-3">
          <p className="text-center text-muted small fw-semibold mb-2">
            <i className="bi bi-mortarboard me-1"></i> Accesos Rápidos para Sustentación
          </p>
          <div className="d-flex flex-column gap-1.5">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger text-start d-flex justify-content-between align-items-center"
              onClick={() => autocompletarCredenciales('admin@servicontrol.com', 'Admin1234*')}
            >
              <span><strong>Admin:</strong> admin@servicontrol.com</span>
              <span className="badge bg-danger">ADMIN</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning text-dark text-start d-flex justify-content-between align-items-center"
              onClick={() => autocompletarCredenciales('supervisor@servicontrol.com', 'Supervisor123*')}
            >
              <span><strong>Supervisor:</strong> supervisor@servicontrol.com</span>
              <span className="badge bg-warning text-dark">SUPERVISOR</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success text-start d-flex justify-content-between align-items-center"
              onClick={() => autocompletarCredenciales('operario1@servicontrol.com', 'Operario123*')}
            >
              <span><strong>Operario:</strong> operario1@servicontrol.com</span>
              <span className="badge bg-success">OPERARIO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

