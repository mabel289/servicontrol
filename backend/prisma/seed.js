import { PrismaClient, RolNombre, EstadoLaboral } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed) para ServiControl...');

  // 1. Crear Roles si no existen
  const rolesData = [
    { nombre: RolNombre.ADMINISTRADOR, descripcion: 'Acceso total y programación del sistema' },
    { nombre: RolNombre.ADMINISTRATIVO, descripcion: 'Gestión de centros de trabajo y usuarios' },
    { nombre: RolNombre.OPERARIO, descripcion: 'Ejecución de actividades y registro de evidencias' },
    { nombre: RolNombre.SUPERVISOR, descripcion: 'Inspección presencial y aprobación de trabajos' }
  ];

  for (const rol of rolesData) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol
    });
  }
  console.log('✅ Roles asegurados.');

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: RolNombre.ADMINISTRADOR } });
  const rolSupervisor = await prisma.rol.findUnique({ where: { nombre: RolNombre.SUPERVISOR } });
  const rolOperario = await prisma.rol.findUnique({ where: { nombre: RolNombre.OPERARIO } });

  // 2. Crear Usuario Administrador inicial
  const adminPasswordHash = await bcrypt.hash('Admin1234*', 10);
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@servicontrol.com' },
    update: {},
    create: {
      email: 'admin@servicontrol.com',
      password: adminPasswordHash,
      nombres: 'Carlos',
      apellidos: 'Restrepo Gómez',
      telefono: '3109876543',
      rolId: rolAdmin.id,
      activo: true
    }
  });
  console.log(`✅ Administrador creado: ${adminUser.email} (Password: Admin1234*)`);

  // 3. Crear Usuario Supervisor inicial
  const supPasswordHash = await bcrypt.hash('Supervisor123*', 10);
  const supervisorUser = await prisma.usuario.upsert({
    where: { email: 'supervisor@servicontrol.com' },
    update: {},
    create: {
      email: 'supervisor@servicontrol.com',
      password: supPasswordHash,
      nombres: 'María Helena',
      apellidos: 'Castillo',
      telefono: '3151234567',
      rolId: rolSupervisor.id,
      activo: true,
      supervisor: {
        create: {
          codigoSupervisor: 'SUP-001'
        }
      }
    }
  });
  console.log(`✅ Supervisor creado: ${supervisorUser.email}`);

  // 4. Crear Usuario Operario inicial con Hoja de Vida
  const opPasswordHash = await bcrypt.hash('Operario123*', 10);
  const operarioUser = await prisma.usuario.upsert({
    where: { email: 'operario1@servicontrol.com' },
    update: {},
    create: {
      email: 'operario1@servicontrol.com',
      password: opPasswordHash,
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Morales',
      telefono: '3187654321',
      rolId: rolOperario.id,
      activo: true,
      operario: {
        create: {
          codigoInstitucional: 'OP-101',
          estadoLaboral: EstadoLaboral.ACTIVO,
          hojaVida: {
            create: {
              numeroIdentificacion: '1020304050',
              direccion: 'Calle 45 # 12-34, Bogotá',
              formacionAcademica: 'Bachiller Técnico y Certificación en Alturas y Manejo Químico de Piscinas',
              experienciaLaboral: '4 años en mantenimiento locativo y jardinería de conjuntos residenciales'
            }
          }
        }
      }
    }
  });
  console.log(`✅ Operario creado: ${operarioUser.email}`);

  // 5. Catálogo de Tipos de Actividad
  const tiposActividad = [
    { nombre: 'Mantenimiento de Piscinas', descripcion: 'Tratamiento químico, aspirado, filtrado y limpieza de bordes' },
    { nombre: 'Jardinería y Zonas Verdes', descripcion: 'Poda de césped, corte de setos, abono y control de plagas' },
    { nombre: 'Pintura y Resane', descripcion: 'Pintura de barandas, resane de muros comunes y demarcación' },
    { nombre: 'Aseo de Zonas Comunes', descripcion: 'Lavado a presión de parqueaderos, limpieza de pasillos y salones' },
    { nombre: 'Reparaciones Locativas Generales', descripcion: 'Ajuste de cerraduras, plomería básica y luminarias' }
  ];

  for (const tipo of tiposActividad) {
    await prisma.tipoActividad.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo
    });
  }
  console.log('✅ Catálogo de tipos de actividad cargado.');

  // 6. Centros de Trabajo (Conjuntos Residenciales)
  const conjuntos = [
    {
      nombre: 'Conjunto Residencial Torres del Parque',
      direccion: 'Carrera 7 # 128-50',
      ciudad: 'Bogotá',
      telefonoContacto: '6017894561',
      nombreAdministrador: 'Dra. Patricia Valencia',
      activo: true
    },
    {
      nombre: 'Conjunto Cerrado Alameda de la Colina',
      direccion: 'Calle 153 # 54-20',
      ciudad: 'Bogotá',
      telefonoContacto: '6014561238',
      nombreAdministrador: 'Ing. Rodrigo Cárdenas',
      activo: true
    },
    {
      nombre: 'Urbanización Portales de San Jorge',
      direccion: 'Transversal 85 # 65-10',
      ciudad: 'Bogotá',
      telefonoContacto: '6018529631',
      nombreAdministrador: 'Lic. Fernando Duarte',
      activo: true
    }
  ];

  for (const conjunto of conjuntos) {
    const existe = await prisma.centroTrabajo.findFirst({
      where: { nombre: conjunto.nombre }
    });
    if (!existe) {
      await prisma.centroTrabajo.create({ data: conjunto });
    }
  }
  console.log('✅ Centros de trabajo (conjuntos residenciales) cargados.');

  console.log('🎉 Carga de datos iniciales finalizada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
