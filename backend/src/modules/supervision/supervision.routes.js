import { Router } from 'express';
import { SupervisionController } from './supervision.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { evaluarActividadSchema } from './supervision.validator.js';

const router = Router();

router.use(authenticate);

// Listar actividades para inspección (Supervisores y Administradores)
router.get('/', authorize('SUPERVISOR', 'ADMINISTRADOR', 'ADMINISTRATIVO'), SupervisionController.listar);

// Emitir veredicto (Aprobar o Rechazar): Exclusivo para Supervisores y Administradores
router.post(
  '/:id/evaluar',
  authorize('SUPERVISOR', 'ADMINISTRADOR'),
  validate(evaluarActividadSchema),
  SupervisionController.evaluar
);

export default router;
