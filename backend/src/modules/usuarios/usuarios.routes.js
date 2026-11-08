import { Router } from 'express';
import { UsuariosController } from './usuarios.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { crearUsuarioSchema, cambiarEstadoUsuarioSchema } from './usuarios.validator.js';

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authenticate);

// Listar usuarios: permitido para ADMINISTRADOR y ADMINISTRATIVO
router.get('/', authorize('ADMINISTRADOR', 'ADMINISTRATIVO'), UsuariosController.listar);

// Crear usuario: permitido para ADMINISTRADOR y ADMINISTRATIVO
router.post(
  '/',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  validate(crearUsuarioSchema),
  UsuariosController.crear
);

// Activar/desactivar usuario: exclusivo para ADMINISTRADOR
router.patch(
  '/:id/estado',
  authorize('ADMINISTRADOR'),
  validate(cambiarEstadoUsuarioSchema),
  UsuariosController.cambiarEstado
);

export default router;
