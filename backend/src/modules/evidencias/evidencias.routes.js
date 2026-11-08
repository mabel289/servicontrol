import { Router } from 'express';
import { EvidenciasController } from './evidencias.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { uploadFoto } from '../../middlewares/upload.js';

const router = Router();

router.use(authenticate);

// Subida de evidencias fotográficas individuales (ANTES, DURANTE, DESPUES)
router.post(
  '/',
  authorize('OPERARIO'),
  uploadFoto.single('foto'),
  EvidenciasController.subirEvidencia
);

export default router;

