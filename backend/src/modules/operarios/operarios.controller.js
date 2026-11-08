import { OperariosService } from './operarios.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class OperariosController {
  static listar = asyncHandler(async (req, res) => {
    const operarios = await OperariosService.listar();

    res.status(200).json({
      status: 'success',
      data: {
        total: operarios.length,
        operarios
      }
    });
  });

  static obtenerPorId = asyncHandler(async (req, res) => {
    const operario = await OperariosService.obtenerPorId(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { operario }
    });
  });

  static guardarHojaVida = asyncHandler(async (req, res) => {
    const hojaVida = await OperariosService.guardarHojaVida(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Hoja de vida actualizada exitosamente',
      data: { hojaVida }
    });
  });
}
