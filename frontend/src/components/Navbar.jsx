import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'bg-danger text-white';
      case 'ADMINISTRATIVO':
        return 'bg-primary text-white';
      case 'SUPERVISOR':
        return 'bg-warning text-dark';
      case 'OPERARIO':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-brand-dark px-3 px-md-4 shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <i className="bi bi-shield-check text-primary fs-4"></i>
          <span>ServiControl</span>
        </Link>

        {user && (
          <>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
                <li className="nav-item">
                  <Link className={`nav-link small ${isActive('/') ? 'active fw-bold text-white' : ''}`} to="/">
                    Inicio
                  </Link>
                </li>

                {(role === 'ADMINISTRADOR' || role === 'ADMINISTRATIVO' || role === 'SUPERVISOR') && (
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link small ${isActive('/programacion') ? 'active fw-bold text-white' : ''}`} to="/programacion">
                        Programación
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link small ${isActive('/supervision') ? 'active fw-bold text-white' : ''}`} to="/supervision">
                        Supervisión
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link small ${isActive('/operarios') ? 'active fw-bold text-white' : ''}`} to="/operarios">
                        Operarios
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link small ${isActive('/reportes') ? 'active fw-bold text-white' : ''}`} to="/reportes">
                        Reportes
                      </Link>
                    </li>
                  </>
                )}

                {role === 'OPERARIO' && (
                  <li className="nav-item">
                    <Link className={`nav-link small ${isActive('/operario/jornada') ? 'active fw-bold text-white' : ''}`} to="/operario/jornada">
                      <i className="bi bi-phone me-1"></i> Mi Jornada Móvil
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div className="d-flex align-items-center gap-3 ms-auto">
              <div className="d-none d-md-flex flex-column text-end">
                <span className="text-white fw-semibold small">
                  {user.nombres} {user.apellidos}
                </span>
                <span className="text-light opacity-75" style={{ fontSize: '0.75rem' }}>
                  {user.email}
                </span>
              </div>

              <span className={`badge rounded-pill px-2.5 py-1.5 fw-normal small ${getRoleBadgeClass()}`}>
                {role}
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline">Salir</span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
