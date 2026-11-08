import { EvidenciasService } from './evidencias.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class EvidenciasController {
  static subirEvidencia = asyncHandler(async (req, res) => {
    const { ejecucionId, tipoEvidencia, fechaCaptura, syncUuid } = req.body;

    const evidencia = await EvidenciasService.guardarEvidencia({
      ejecucionId,
      tipoEvidencia,
      file: req.file,
      fechaCaptura,
      syncUuid
    });

    res.status(201).json({
      status: 'success',
      message: `Evidencia de tipo ${tipoEvidencia} guardada exitosamente`,
      data: { evidencia }
    });
  });
}
