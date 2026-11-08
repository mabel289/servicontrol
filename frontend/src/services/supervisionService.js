import { apiClient } from './apiClient';

export const supervisionService = {
  async listar(estado = null) {
    const res = await apiClient.get('/supervision', {
      params: estado ? { estado } : {}
    });
    return res.data.actividades;
  },

  async evaluar(id, datos) {
    const res = await apiClient.post(`/supervision/${id}/evaluar`, datos);
    return res.data.revision;
  }
};
