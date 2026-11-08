import { PrismaClient, EstadoProgramacion, EstadoActividad } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📅 Creando programación semanal de prueba en Supabase...');

  const semana = '2026-W46';
  let prog = await prisma.programacionSemanal.findUnique({ where: { semana } });

  if (!prog) {
    prog = await prisma.programacionSemanal.create({
      data: {
        semana,
        fechaInicio: new Date('2026-11-09T00:00:00Z'),
        fechaFin: new Date('2026-11-13T23:59:59Z'),
        estado: EstadoProgramacion.PUBLICADA,
        observaciones: 'Mantenimientos preventivos programados para la semana en curso'
      }
    });
    console.log(`✅ Programación ${semana} creada.`);
  }

  const [centro1, centro2, centro3] = await prisma.centroTrabajo.findMany({ take: 3 });
  const [tipoPiscina, tipoJardin, tipoPintura] = await prisma.tipoActividad.findMany({ take: 3 });
  const [op1, op2, op3] = await prisma.operario.findMany({
    take: 3,
    orderBy: { codigoInstitucional: 'asc' }
  });

  const fechaLabor = new Date('2026-11-10T00:00:00Z');

  // Asignación 1
  const asig1Existe = await prisma.asignacionActividad.findFirst({
    where: { programacionId: prog.id, operarioId: op1.id }
  });
  if (!asig1Existe) {
    await prisma.asignacionActividad.create({
      data: {
        programacionId: prog.id,
        centroTrabajoId: centro1.id,
        operarioId: op1.id,
        tipoActividadId: tipoPiscina.id,
        fecha: fechaLabor,
        horaInicioEstimada: '08:00',
        horaFinEstimada: '12:00',
        instrucciones: 'Aspirado profundo, medición de pH, cloro al 70% y limpieza de bordes perimetrales.',
        estado: EstadoActividad.PROGRAMADA
      }
    });
  }

  // Asignación 2
  const asig2Existe = await prisma.asignacionActividad.findFirst({
    where: { programacionId: prog.id, operarioId: op2.id }
  });
  if (!asig2Existe) {
    await prisma.asignacionActividad.create({
      data: {
        programacionId: prog.id,
        centroTrabajoId: centro2.id,
        operarioId: op2.id,
        tipoActividadId: tipoJardin.id,
        fecha: fechaLabor,
        horaInicioEstimada: '08:00',
        horaFinEstimada: '13:00',
        instrucciones: 'Poda de césped en jardineras principales y corte de setos vivos.',
        estado: EstadoActividad.PROGRAMADA
      }
    });
  }

  // Asignación 3
  const asig3Existe = await prisma.asignacionActividad.findFirst({
    where: { programacionId: prog.id, operarioId: op3.id }
  });
  if (!asig3Existe) {
    await prisma.asignacionActividad.create({
      data: {
        programacionId: prog.id,
        centroTrabajoId: centro3.id,
        operarioId: op3.id,
        tipoActividadId: tipoPintura.id,
        fecha: fechaLabor,
        horaInicioEstimada: '13:00',
        horaFinEstimada: '17:00',
        instrucciones: 'Resane y pintura de barandas en accesos peatonales y salón comunal.',
        estado: EstadoActividad.PROGRAMADA
      }
    });
  }

  console.log('✅ Actividades demostrativas asignadas con éxito en Supabase.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

