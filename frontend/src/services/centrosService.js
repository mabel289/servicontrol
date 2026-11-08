import { apiClient } from './apiClient';

export const centrosService = {
  async listar(soloActivos = false) {
    const res = await apiClient.get('/centros-trabajo', {
      params: { activos: soloActivos }
    });
    return res.data.centros;
  },

  async crear(datos) {
    const res = await apiClient.post('/centros-trabajo', datos);
    return res.data.centro;
  }
};
