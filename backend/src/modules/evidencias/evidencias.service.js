import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/appError.js';
import crypto from 'crypto';

export class EvidenciasService {
  /**
   * Registra una evidencia fotográfica en la base de datos asociada a la ejecución.
   * El archivo físico ya fue colocado en /uploads por Multer.
   *
   * @param {object} datos
   */
  static async guardarEvidencia(datos) {
    const { ejecucionId, tipoEvidencia, file, fechaCaptura, syncUuid } = datos;

    if (!file) {
      throw new AppError('No se recibió ningún archivo de imagen', 400);
    }

    const uuidFinal = syncUuid || crypto.randomUUID();

    // Idempotencia: Verificar si ya existe con este syncUuid
    const existente = await prisma.evidenciaFotografica.findUnique({
      where: { syncUuid: uuidFinal }
    });
    if (existente) {
      return existente;
    }

    // 1. Resolver el id real de la ejecución (acepta id de ejecución o id de asignación)
    let ejecucion = await prisma.ejecucionActividad.findUnique({
      where: { id: ejecucionId }
    });

    if (!ejecucion) {
      ejecucion = await prisma.ejecucionActividad.findFirst({
        where: { asignacionId: ejecucionId }
      });
    }

    if (!ejecucion) {
      const asignacion = await prisma.asignacionActividad.findUnique({
        where: { id: ejecucionId }
      });
      if (asignacion) {
        ejecucion = await prisma.ejecucionActividad.create({
          data: {
            asignacionId: asignacion.id,
            horaInicioReal: new Date(),
            syncUuid: crypto.randomUUID()
          }
        });
      } else {
        throw new AppError('No se encontró la ejecución o asignación para esta evidencia', 404);
      }
    }

    const fechaCapturaDate = fechaCaptura ? new Date(fechaCaptura) : new Date();

    return await prisma.evidenciaFotografica.create({
      data: {
        ejecucionId: ejecucion.id,
        tipoEvidencia,
        urlArchivo: `/uploads/${file.filename}`,
        nombreArchivo: file.originalname,
        pesoBytes: file.size,
        mimeType: file.mimetype,
        fechaCaptura: fechaCapturaDate,
        syncUuid: uuidFinal
      }
    });
  }
}

