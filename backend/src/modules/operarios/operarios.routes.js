import { Router } from 'express';
import { OperariosController } from './operarios.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { actualizarHojaVidaSchema } from './operarios.validator.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar operarios
router.get('/', authorize('ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR'), OperariosController.listar);

// Ver operario específico
router.get('/:id', authorize('ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR'), OperariosController.obtenerPorId);

// Registrar o actualizar Hoja de Vida
router.put(
  '/:id/hoja-vida',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  validate(actualizarHojaVidaSchema),
  OperariosController.guardarHojaVida
);

export default router;

