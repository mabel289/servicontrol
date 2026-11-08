import { Router } from 'express';
import { CentrosTrabajoController } from './centros-trabajo.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y consultar (permitido para todos los roles autenticados)
router.get('/', CentrosTrabajoController.listar);
router.get('/:id', CentrosTrabajoController.obtenerPorId);

// Registrar nuevos conjuntos: solo ADMINISTRADOR y ADMINISTRATIVO
router.post('/', authorize('ADMINISTRADOR', 'ADMINISTRATIVO'), CentrosTrabajoController.crear);

export default router;

