import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleRoute } from './components/routing/RoleRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProgramacionPage } from './pages/programacion/ProgramacionPage';
import { OperariosPage } from './pages/operarios/OperariosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rutas protegidas genéricas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />

                {/* Rutas para Administradores, Administrativos y Supervisores */}
                <Route element={<RoleRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR']} />}>
                  <Route path="/programacion" element={<ProgramacionPage />} />
                  <Route path="/operarios" element={<OperariosPage />} />
                </Route>
              </Route>

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-top py-3 text-center text-secondary small">
            <div className="container">
              ServiControl &copy; {new Date().getFullYear()} - Sistema de Gestión de Servicios Locativos | Arquitectura Monolito Modular
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
