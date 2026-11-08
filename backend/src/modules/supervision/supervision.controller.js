import { SupervisionService } from './supervision.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class SupervisionController {
  static listar = asyncHandler(async (req, res) => {
    const { estado } = req.query;
    const actividades = await SupervisionService.listarActividades(estado);

    res.status(200).json({
      status: 'success',
      data: {
        total: actividades.length,
        actividades
      }
    });
  });

  static evaluar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const revision = await SupervisionService.evaluarActividad({
      ejecucionId: id,
      supervisorUsuarioId: req.user.id,
      estado,
      observaciones
    });

    res.status(200).json({
      status: 'success',
      message: `Actividad ${estado === 'APROBADA' ? 'aprobada' : 'rechazada'} exitosamente`,
      data: { revision }
    });
  });
}

