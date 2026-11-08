import { ProgramacionService } from './programacion.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/appError.js';

export class ProgramacionController {
  static listarTiposActividad = asyncHandler(async (req, res) => {
    const tipos = await ProgramacionService.listarTiposActividad();
    res.status(200).json({
      status: 'success',
      data: { tipos }
    });
  });

  static listar = asyncHandler(async (req, res) => {
    const programaciones = await ProgramacionService.listarProgramaciones();
    res.status(200).json({
      status: 'success',
      data: {
        total: programaciones.length,
        programaciones
      }
    });
  });

  static obtenerPorId = asyncHandler(async (req, res) => {
    const programacion = await ProgramacionService.obtenerProgramacion(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { programacion }
    });
  });

  static crear = asyncHandler(async (req, res) => {
    const nueva = await ProgramacionService.crearProgramacion(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Programación semanal creada exitosamente',
      data: { programacion: nueva }
    });
  });

  static asignarActividad = asyncHandler(async (req, res) => {
    const asignacion = await ProgramacionService.asignarActividad(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Actividad asignada exitosamente al operario sin conflictos de horario',
      data: { asignacion }
    });
  });

  static misActividades = asyncHandler(async (req, res) => {
    if (!req.user.operario) {
      throw new AppError('El usuario autenticado no tiene un perfil de operario asociado', 403);
    }

    const { fecha } = req.query;
    const actividades = await ProgramacionService.obtenerActividadesOperario(req.user.operario.id, fecha);

    res.status(200).json({
      status: 'success',
      data: {
        total: actividades.length,
        actividades
      }
    });
  });

  static eliminarAsignacion = asyncHandler(async (req, res) => {
    await ProgramacionService.eliminarAsignacion(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Asignación de actividad cancelada y eliminada'
    });
  });

  static notificar = asyncHandler(async (req, res) => {
    const resultado = await ProgramacionService.notificarProgramacion(req.params.id);
    res.status(200).json({
      status: 'success',
      message: `Programación semanal notificada a ${resultado.totalNotificados} operario(s)`,
      data: resultado
    });
  });
}

