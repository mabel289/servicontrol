import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guardia de ruta basada en roles (RBAC en Frontend).
 * Permite el acceso solo si el rol del usuario coincide con los roles autorizados.
 */
export const RoleRoute = ({ allowedRoles }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-warning p-4 shadow-sm rounded-3">
          <i className="bi bi-shield-slash fs-1 text-warning d-block mb-2"></i>
          <h4 className="fw-bold">Acceso Restringido</h4>
          <p className="text-secondary mb-3">
            Tu rol actual (<strong>{role}</strong>) no tiene autorización para acceder a este módulo.
          </p>
          <a href="/" className="btn btn-primary">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
