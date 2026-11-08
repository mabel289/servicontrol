import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El formato del correo electrónico es inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const cambiarPasswordSchema = z.object({
  passwordActual: z
    .string({ required_error: 'La contraseña actual es obligatoria' }),
  passwordNueva: z
    .string({ required_error: 'La nueva contraseña es obligatoria' })
    .min(8, 'La nueva contraseña debe tener mínimo 8 caracteres')
});

