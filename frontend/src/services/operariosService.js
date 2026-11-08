import { apiClient } from './apiClient';

export const operariosService = {
  async listar() {
    const res = await apiClient.get('/operarios');
    return res.data.operarios;
  },

  async obtenerPorId(id) {
    const res = await apiClient.get(`/operarios/${id}`);
    return res.data.operario;
  },

  async guardarHojaVida(operarioId, datos) {
    const res = await apiClient.put(`/operarios/${operarioId}/hoja-vida`, datos);
    return res.data.hojaVida;
  }
};

