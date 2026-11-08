import { AsistenciaService } from './asistencia.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/appError.js';

export class AsistenciaController {
  static registrarEntrada = asyncHandler(async (req, res) => {
    if (!req.user.operario) {
      throw new AppError('Solo los operarios pueden registrar asistencia', 403);
    }

    const { centroTrabajoId, fecha, horaEntrada, syncUuid } = req.body;
    const asistencia = await AsistenciaService.registrarEntrada({
      operarioId: req.user.operario.id,
      centroTrabajoId,
      fecha,
      horaEntrada,
      syncUuid
    });

    res.status(201).json({
      status: 'success',
      message: 'Hora de entrada registrada exitosamente',
      data: { asistencia }
    });
  });

  static registrarSalida = asyncHandler(async (req, res) => {
    const { asistenciaId, syncUuid, horaSalida } = req.body;
    const asistencia = await AsistenciaService.registrarSalida({
      asistenciaId,
      syncUuid,
      horaSalida
    });

    res.status(200).json({
      status: 'success',
      message: `Hora de salida registrada. Tiempo de permanencia: ${asistencia.minutosPermanencia} minutos`,
      data: { asistencia }
    });
  });

  static hoy = asyncHandler(async (req, res) => {
    if (!req.user.operario) {
      throw new AppError('Solo los operarios pueden consultar su asistencia de hoy', 403);
    }

    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const asistencia = await AsistenciaService.obtenerAsistenciaHoy(req.user.operario.id, fecha);

    res.status(200).json({
      status: 'success',
      data: { asistencia }
    });
  });
}
