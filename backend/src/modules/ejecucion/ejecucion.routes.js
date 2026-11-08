import { Router } from 'express';
import { EjecucionController } from './ejecucion.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.use(authenticate);

// Operarios registran el inicio y fin de sus actividades
router.post('/iniciar', authorize('OPERARIO'), EjecucionController.iniciar);
router.post('/finalizar', authorize('OPERARIO'), EjecucionController.finalizar);

export default router;
