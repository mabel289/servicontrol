import { z } from 'zod';
import { EstadoRevision } from '@prisma/client';

export const evaluarActividadSchema = z.object({
  estado: z.nativeEnum(EstadoRevision, {
    errorMap: () => ({ message: 'El estado de evaluación debe ser APROBADA o RECHAZADA' })
  }),
  observaciones: z
    .string()
    .optional()
    .default('')
}).refine((data) => {
  // Regla de negocio académica: Observaciones obligatorias si es RECHAZADA
  if (data.estado === EstadoRevision.RECHAZADA) {
    return data.observaciones && data.observaciones.trim().length >= 10;
  }
  return true;
}, {
  message: 'Al rechazar una actividad es obligatorio registrar una observación detallada (mínimo 10 caracteres)',
  path: ['observaciones']
});
