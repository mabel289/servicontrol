import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AuthController {
  /**
   * Endpoint de Inicio de Sesión
   * POST /api/auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const resultado = await AuthService.login(email, password);

    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: resultado
    });
  });

  /**
   * Endpoint para obtener perfil del usuario en sesión
   * GET /api/auth/me
   */
  static me = asyncHandler(async (req, res) => {
    const usuario = await AuthService.getPerfil(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  });
}

