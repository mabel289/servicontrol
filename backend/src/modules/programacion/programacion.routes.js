import { Router } from 'express';
import { ProgramacionController } from './programacion.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { crearProgramacionSchema, asignarActividadSchema } from './programacion.validator.js';

const router = Router();

// Todas las rutas de programación requieren autenticación
router.use(authenticate);

// Catálogo de tipos de actividad (accesible para crear asignaciones)
router.get('/tipos-actividad', ProgramacionController.listarTiposActividad);

// Consulta exclusiva del operario: solo sus propias actividades
router.get('/mis-actividades', authorize('OPERARIO'), ProgramacionController.misActividades);

// Consulta de programaciones generales: Administradores, Administrativos y Supervisores
router.get('/', authorize('ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR'), ProgramacionController.listar);
router.get('/:id', authorize('ADMINISTRADOR', 'ADMINISTRATIVO', 'SUPERVISOR'), ProgramacionController.obtenerPorId);

// Creación y asignación: Administradores y Administrativos
router.post(
  '/',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  validate(crearProgramacionSchema),
  ProgramacionController.crear
);

router.post(
  '/asignar',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  validate(asignarActividadSchema),
  ProgramacionController.asignarActividad
);

router.post(
  '/:id/notificar',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  ProgramacionController.notificar
);

router.delete(
  '/asignaciones/:id',
  authorize('ADMINISTRADOR', 'ADMINISTRATIVO'),
  ProgramacionController.eliminarAsignacion
);

export default router;

