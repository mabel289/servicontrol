import { apiClient } from './apiClient';

export const reportesService = {
  async obtenerResumen() {
    const res = await apiClient.get('/reportes/resumen');
    return res.data;
  }
};

