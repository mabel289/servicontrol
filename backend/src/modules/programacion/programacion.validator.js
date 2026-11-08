import { z } from 'zod';
import { EstadoActividad, EstadoProgramacion } from '@prisma/client';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Formato HH:mm (24 horas)

export const crearProgramacionSchema = z.object({
  semana: z
    .string({ required_error: 'El código de la semana es obligatorio' })
    .regex(/^\d{4}-W\d{2}$/, 'El formato de semana debe ser AAAA-WSS (ej: 2026-W45)'),
  fechaInicio: z
    .string({ required_error: 'La fecha de inicio (lunes) es obligatoria' })
    .datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  fechaFin: z
    .string({ required_error: 'La fecha de fin (viernes) es obligatoria' })
    .datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  observaciones: z
    .string()
    .optional()
});

export const asignarActividadSchema = z.object({
  programacionId: z
    .string({ required_error: 'El ID de la programación es obligatorio' }),
  centroTrabajoId: z
    .string({ required_error: 'El centro de trabajo (conjunto) es obligatorio' }),
  operarioId: z
    .string({ required_error: 'El operario es obligatorio' }),
  tipoActividadId: z
    .number({ required_error: 'El tipo de actividad es obligatorio' }),
  fecha: z
    .string({ required_error: 'La fecha es obligatoria (AAAA-MM-DD)' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Utilice AAAA-MM-DD'),
  horaInicioEstimada: z
    .string({ required_error: 'La hora de inicio es obligatoria' })
    .regex(timeRegex, 'La hora de inicio debe estar en formato HH:mm (ej: 08:00)'),
  horaFinEstimada: z
    .string({ required_error: 'La hora de fin es obligatoria' })
    .regex(timeRegex, 'La hora de fin debe estar en formato HH:mm (ej: 12:00)'),
  instrucciones: z
    .string()
    .optional()
}).refine((data) => data.horaInicioEstimada < data.horaFinEstimada, {
  message: 'La hora de inicio estimada debe ser anterior a la hora de fin estimada',
  path: ['horaFinEstimada']
});

export const cambiarEstadoAsignacionSchema = z.object({
  estado: z.nativeEnum(EstadoActividad, { errorMap: () => ({ message: 'Estado de actividad inválido' }) })
});
