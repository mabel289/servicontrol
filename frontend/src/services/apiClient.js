import axios from 'axios';

/**
 * Cliente Axios centralizado para ServiControl.
 * Configura la URL base y el manejo uniforme de errores de red.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar token JWT automáticamente cuando esté disponible
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('servicontrol_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de respuesta para normalizar mensajes de error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(errorMsg));
  }
);

