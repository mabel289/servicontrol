import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';

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

              {/* Rutas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
                {/* Las rutas para las siguientes etapas se montarán aquí */}
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
