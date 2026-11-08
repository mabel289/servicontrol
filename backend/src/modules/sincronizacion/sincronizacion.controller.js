import { SincronizacionService } from './sincronizacion.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/appError.js';

export class SincronizacionController {
  static sincronizarLote = asyncHandler(async (req, res) => {
    if (!req.user.operario) {
      throw new AppError('Solo los operarios pueden sincronizar datos de campo', 403);
    }

    const resultado = await SincronizacionService.procesarLote(req.user.operario.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Sincronización por lotes procesada exitosamente',
      data: resultado
    });
  });
}

