import { Router } from 'express';
import { AsistenciaController } from './asistencia.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.use(authenticate);

// Endpoints del operario
router.post('/entrada', authorize('OPERARIO'), AsistenciaController.registrarEntrada);
router.post('/salida', authorize('OPERARIO'), AsistenciaController.registrarSalida);
router.get('/hoy', authorize('OPERARIO'), AsistenciaController.hoy);

export default router;

