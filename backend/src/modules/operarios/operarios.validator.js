import { z } from 'zod';

export const actualizarHojaVidaSchema = z.object({
  numeroIdentificacion: z
    .string({ required_error: 'El número de identificación es obligatorio' })
    .min(5, 'El número de identificación debe tener al menos 5 dígitos'),
  direccion: z
    .string({ required_error: 'La dirección es obligatoria' })
    .min(5, 'La dirección debe ser descriptiva'),
  formacionAcademica: z
    .string({ required_error: 'La formación académica es obligatoria' }),
  experienciaLaboral: z
    .string({ required_error: 'La experiencia laboral es obligatoria' }),
  telefono: z
    .string()
    .optional()
});

