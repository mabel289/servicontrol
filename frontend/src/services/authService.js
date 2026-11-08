import { apiClient } from './apiClient';

export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Obtiene la información del usuario autenticado actual.
   */
  async getPerfil() {
    const response = await apiClient.get('/auth/me');
    return response.data.usuario;
  }
};
