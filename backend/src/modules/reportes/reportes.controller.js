import { ReportesService } from './reportes.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class ReportesController {
  static resumenGeneral = asyncHandler(async (req, res) => {
    const reporte = await ReportesService.obtenerResumenGeneral();

    res.status(200).json({
      status: 'success',
      data: reporte
    });
  });
}

