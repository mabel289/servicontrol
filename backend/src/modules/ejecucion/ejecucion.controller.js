import { EjecucionService } from './ejecucion.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class EjecucionController {
  static iniciar = asyncHandler(async (req, res) => {
    const { asignacionId, horaInicioReal, syncUuid } = req.body;
    const ejecucion = await EjecucionService.iniciarActividad({
      asignacionId,
      horaInicioReal,
      syncUuid
    });

    res.status(200).json({
      status: 'success',
      message: 'Actividad iniciada exitosamente',
      data: { ejecucion }
    });
  });

  static finalizar = asyncHandler(async (req, res) => {
    const { asignacionId, horaFinReal, observacionesOperario } = req.body;
    const ejecucion = await EjecucionService.finalizarActividad({
      asignacionId,
      horaFinReal,
      observacionesOperario
    });

    res.status(200).json({
      status: 'success',
      message: 'Actividad finalizada y enviada a revisión del supervisor',
      data: { ejecucion }
    });
  });
}
