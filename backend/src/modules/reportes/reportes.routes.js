import { Router } from 'express';
import { ReportesController } from './reportes.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.use(authenticate);

// Reportes e Indicadores: Exclusivo para Administrador, Administrativo y Supervisor
router.get(
  '/resumen',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR'),
  ReportesController.resumenGeneral
);

export default router;

