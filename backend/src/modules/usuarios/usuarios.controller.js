import { UsuariosService } from './usuarios.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class UsuariosController {
  /**
   * GET /api/usuarios
   */
  static listar = asyncHandler(async (req, res) => {
    const { rol } = req.query;
    const usuarios = await UsuariosService.listarUsuarios(rol);

    res.status(200).json({
      status: 'success',
      data: {
        total: usuarios.length,
        usuarios
      }
    });
  });

  /**
   * POST /api/usuarios
   */
  static crear = asyncHandler(async (req, res) => {
    const nuevoUsuario = await UsuariosService.crearUsuario(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: { usuario: nuevoUsuario }
    });
  });

  /**
   * PATCH /api/usuarios/:id/estado
   */
  static cambiarEstado = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    const usuarioActualizado = await UsuariosService.cambiarEstado(id, activo);

    res.status(200).json({
      status: 'success',
      message: `Usuario ${activo ? 'activado' : 'desactivado'} con éxito`,
      data: { usuario: usuarioActualizado }
    });
  });
}
