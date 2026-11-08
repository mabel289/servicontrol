import { apiClient } from './apiClient';

export const programacionService = {
  async listar() {
    const res = await apiClient.get('/programacion');
    return res.data.programaciones;
  },

  async obtenerPorId(id) {
    const res = await apiClient.get(`/programacion/${id}`);
    return res.data.programacion;
  },

  async crear(datos) {
    const res = await apiClient.post('/programacion', datos);
    return res.data.programacion;
  },

  async asignar(datos) {
    const res = await apiClient.post('/programacion/asignar', datos);
    return res.data.asignacion;
  },

  async eliminarAsignacion(id) {
    const res = await apiClient.delete(`/programacion/asignaciones/${id}`);
    return res;
  },

  async listarTiposActividad() {
    const res = await apiClient.get('/programacion/tipos-actividad');
    return res.data.tipos;
  },

  async misActividades(fecha = null) {
    const res = await apiClient.get('/programacion/mis-actividades', {
      params: fecha ? { fecha } : {}
    });
    return res.data.actividades;
  }
};

