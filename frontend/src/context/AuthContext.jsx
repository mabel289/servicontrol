import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('servicontrol_token'));
  const [loading, setLoading] = useState(true);

  // Al cargar la app, si hay token en localStorage, validar y cargar perfil
  useEffect(() => {
    const cargarUsuario = async () => {
      const storedToken = localStorage.getItem('servicontrol_token');
      if (storedToken) {
        try {
          const perfil = await authService.getPerfil();
          setUser(perfil);
        } catch (error) {
          console.warn('Sesión previa inválida o expirada:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    cargarUsuario();
  }, []);

  const login = async (email, password) => {
    const { usuario, token: nuevoToken } = await authService.login(email, password);
    localStorage.setItem('servicontrol_token', nuevoToken);
    localStorage.setItem('servicontrol_user', JSON.stringify(usuario));
    setToken(nuevoToken);
    setUser(usuario);
    return usuario;
  };

  const logout = () => {
    localStorage.removeItem('servicontrol_token');
    localStorage.removeItem('servicontrol_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.rol?.nombre || null,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

