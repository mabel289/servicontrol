import { CentrosTrabajoService } from './centros-trabajo.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class CentrosTrabajoController {
  static listar = asyncHandler(async (req, res) => {
    const soloActivos = req.query.activos === 'true';
    const centros = await CentrosTrabajoService.listar(soloActivos);

    res.status(200).json({
      status: 'success',
      data: {
        total: centros.length,
        centros
      }
    });
  });

  static obtenerPorId = asyncHandler(async (req, res) => {
    const centro = await CentrosTrabajoService.obtenerPorId(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { centro }
    });
  });

  static crear = asyncHandler(async (req, res) => {
    const nuevoCentro = await CentrosTrabajoService.crear(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Conjunto residencial registrado exitosamente',
      data: { centro: nuevoCentro }
    });
  });
}
