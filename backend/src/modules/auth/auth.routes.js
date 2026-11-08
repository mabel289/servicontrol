import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema } from './auth.validator.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Rutas públicas
router.post('/login', validate(loginSchema), AuthController.login);

// Rutas protegidas (requieren JWT válido)
router.get('/me', authenticate, AuthController.me);

export default router;

