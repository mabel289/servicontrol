import { Router } from 'express';
import { SincronizacionController } from './sincronizacion.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.use(authenticate);

// Endpoint de sincronización por lotes para operarios offline
router.post('/lote', authorize('OPERARIO'), SincronizacionController.sincronizarLote);

export default router;

