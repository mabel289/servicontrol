import { z } from 'zod';
import { RolNombre } from '@prisma/client';

export const crearUsuarioSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El formato del correo electrónico es inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe contener al menos 6 caracteres'),
  nombres: z
    .string({ required_error: 'Los nombres son obligatorios' })
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .trim(),
  apellidos: z
    .string({ required_error: 'Los apellidos son obligatorios' })
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .trim(),
  telefono: z
    .string()
    .optional(),
  rol: z
    .nativeEnum(RolNombre, { errorMap: () => ({ message: 'Rol inválido' }) })
});

export const cambiarEstadoUsuarioSchema = z.object({
  activo: z.boolean({ required_error: 'El estado activo (true/false) es obligatorio' })
});
