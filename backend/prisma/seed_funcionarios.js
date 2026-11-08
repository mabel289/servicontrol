import { PrismaClient, RolNombre, EstadoLaboral } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const nombresMasc = [
  'Juan', 'Carlos', 'Andrés', 'Pedro', 'Luis', 'Jorge', 'Diego', 'Mateo', 'Daniel', 'Alejandro',
  'Gabriel', 'Santiago', 'David', 'Camilo', 'Felipe', 'Manuel', 'Ricardo', 'Óscar', 'Héctor', 'Javier',
  'Eduardo', 'Mauricio', 'Fernando', 'César', 'Leonardo', 'Nelson', 'Hugo', 'Jaime', 'Álvaro', 'Rubén'
];

const nombresFem = [
  'María', 'Laura', 'Ana', 'Carolina', 'Diana', 'Paola', 'Claudia', 'Sandra', 'Andrea', 'Natalia',
  'Camila', 'Daniela', 'Valentina', 'Juliana', 'Mónica', 'Patricia', 'Gloria', 'Adriana', 'Liliana', 'Martha'
];

const apellidos = [
  'Rodríguez', 'Gómez', 'González', 'Martínez', 'García', 'López', 'Hernández', 'Sánchez', 'Pérez', 'Ramírez',
  'Torres', 'Flores', 'Díaz', 'Vásquez', 'Castro', 'Morales', 'Jiménez', 'Reyes', 'Ríos', 'Álvarez',
  'Ruiz', 'Mendoza', 'Suárez', 'Castillo', 'Moreno', 'Ortiz', 'Gutiérrez', 'Chávez', 'Silva', 'Ramos',
  'Vargas', 'Herrera', 'Medina', 'Aguilar', 'Paredes', 'Campos', 'Guzmán', 'Santos', 'Cabrera', 'Navarro'
];

const formaciones = [
  'Técnico Laboral en Mantenimiento de Piscinas y Manipulación de Sustancias Químicas (SENA)',
  'Técnico en Jardinería Urbana, Poda y Control Fitosanitario de Zonas Verdes',
  'Certificación Trabajo Seguro en Alturas (Nivel Avanzado) y Pintura Arquitectónica',
  'Técnico en Instalaciones Hidráulicas Básicas y Mantenimiento Locativo',
  'Operario Integral de Mantenimiento Preventivo de Zonas Comunes en Propiedad Horizontal'
];

const experiencias = [
  '3 años en mantenimiento preventivo y correctivo en conjuntos residenciales del norte y occidente de Bogotá',
  '5 años como operador de zonas húmedas, cuartos de máquinas, filtrado de piscinas y motobombas',
  '4 años en labores de jardinería, paisajismo, corte de césped y mantenimiento de cercas vivas',
  '3 años en pintura epóxica, resane de muros comunes, demarcación vial de parqueaderos y cerrajería',
  '6 años en servicios generales y atención rápida de incidencias locativas en edificios residenciales'
];

const localidades = ['Suba', 'Usaquén', 'Engativá', 'Fontibón', 'Kennedy', 'Bosa', 'Teusaquillo', 'Chapinero'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🚀 Iniciando población completa de funcionarios según el planteamiento del problema:');
  console.log('   - 20 Administrativos');
  console.log('   - 30 Supervisores');
  console.log('   - 150 Operarios con Hojas de Vida completas');

  // Roles
  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: RolNombre.ADMINISTRADOR } });
  const rolAdministrativo = await prisma.rol.findUnique({ where: { nombre: RolNombre.ADMINISTRATIVO } });
  const rolSupervisor = await prisma.rol.findUnique({ where: { nombre: RolNombre.SUPERVISOR } });
  const rolOperario = await prisma.rol.findUnique({ where: { nombre: RolNombre.OPERARIO } });

  // Hashes precargados para alta velocidad de inserción
  const passAdminHash = await bcrypt.hash('Admin1234*', 10);
  const passSupHash = await bcrypt.hash('Supervisor123*', 10);
  const passOpHash = await bcrypt.hash('Operario123*', 10);

  // -------------------------------------------------------------------------
  // 1. ADMINISTRATIVOS (Total: 20)
  // -------------------------------------------------------------------------
  console.log('\n📁 Generando 20 Administrativos...');
  for (let i = 1; i <= 20; i++) {
    const email = i === 1 ? 'administrativo@servicontrol.com' : `administrativo${i}@servicontrol.com`;
    const esFem = i % 2 === 0;
    const nombres = esFem ? `${getRandomItem(nombresFem)} ${getRandomItem(nombresFem)}` : `${getRandomItem(nombresMasc)} ${getRandomItem(nombresMasc)}`;
    const apellidosPersona = `${getRandomItem(apellidos)} ${getRandomItem(apellidos)}`;
    const telefono = `31${Math.floor(10000000 + Math.random() * 89999999)}`;

    await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: passAdminHash,
        nombres: i === 1 ? 'Laura Sofía' : nombres,
        apellidos: i === 1 ? 'Méndez Rincón' : apellidosPersona,
        telefono,
        rolId: rolAdministrativo.id,
        activo: true
      }
    });
  }
  console.log('✅ 20 Administrativos asegurados en base de datos.');

  // -------------------------------------------------------------------------
  // 2. SUPERVISORES (Total: 30)
  // -------------------------------------------------------------------------
  console.log('\n📁 Generando 30 Supervisores...');
  for (let i = 1; i <= 30; i++) {
    const email = i === 1 ? 'supervisor@servicontrol.com' : `supervisor${i}@servicontrol.com`;
    const codigoSupervisor = `SUP-${String(i).padStart(3, '0')}`;
    const esFem = i % 3 === 0;
    const nombres = esFem ? `${getRandomItem(nombresFem)} ${getRandomItem(nombresFem)}` : `${getRandomItem(nombresMasc)} ${getRandomItem(nombresMasc)}`;
    const apellidosPersona = `${getRandomItem(apellidos)} ${getRandomItem(apellidos)}`;
    const telefono = `31${Math.floor(10000000 + Math.random() * 89999999)}`;

    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: passSupHash,
        nombres: i === 1 ? 'María Helena' : nombres,
        apellidos: i === 1 ? 'Castillo' : apellidosPersona,
        telefono,
        rolId: rolSupervisor.id,
        activo: true
      }
    });

    const supExiste = await prisma.supervisor.findUnique({
      where: { usuarioId: usuario.id }
    });

    if (!supExiste) {
      await prisma.supervisor.create({
        data: {
          usuarioId: usuario.id,
          codigoSupervisor,
          activo: true
        }
      });
    }
  }
  console.log('✅ 30 Supervisores asegurados con códigos SUP-001 al SUP-030.');

  // -------------------------------------------------------------------------
  // 3. OPERARIOS CON HOJA DE VIDA (Total: 150)
  // -------------------------------------------------------------------------
  console.log('\n📁 Generando 150 Operarios con sus Hojas de Vida...');
  for (let i = 1; i <= 150; i++) {
    const email = `operario${i}@servicontrol.com`;
    const codigoInstitucional = `OP-${100 + i}`;
    const cedula = i === 1 ? '1020304050' : String(1095000000 + i);
    const esFem = i % 5 === 0;
    const nombres = esFem ? `${getRandomItem(nombresFem)} ${getRandomItem(nombresFem)}` : `${getRandomItem(nombresMasc)} ${getRandomItem(nombresMasc)}`;
    const apellidosPersona = `${getRandomItem(apellidos)} ${getRandomItem(apellidos)}`;
    const telefono = `31${Math.floor(10000000 + Math.random() * 89999999)}`;
    const direccion = `Calle ${Math.floor(10 + Math.random() * 150)} # ${Math.floor(1 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 80)}, ${getRandomItem(localidades)}, Bogotá`;

    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: passOpHash,
        nombres: i === 1 ? 'Juan Carlos' : nombres,
        apellidos: i === 1 ? 'Pérez Morales' : apellidosPersona,
        telefono,
        rolId: rolOperario.id,
        activo: true
      }
    });

    const opExiste = await prisma.operario.findUnique({
      where: { usuarioId: usuario.id },
      include: { hojaVida: true }
    });

    if (!opExiste) {
      // Verificar que la cédula no esté en uso por otro registro previo
      const cedulaEnUso = await prisma.hojaVida.findUnique({
        where: { numeroIdentificacion: cedula }
      });
      const cedulaFinal = cedulaEnUso ? String(1099000000 + i) : cedula;

      await prisma.operario.create({
        data: {
          usuarioId: usuario.id,
          codigoInstitucional,
          estadoLaboral: EstadoLaboral.ACTIVO,
          hojaVida: {
            create: {
              numeroIdentificacion: cedulaFinal,
              direccion,
              formacionAcademica: getRandomItem(formaciones),
              experienciaLaboral: getRandomItem(experiencias)
            }
          }
        }
      });
    } else if (!opExiste.hojaVida) {
      const cedulaEnUso = await prisma.hojaVida.findUnique({
        where: { numeroIdentificacion: cedula }
      });
      const cedulaFinal = cedulaEnUso ? String(1099000000 + i) : cedula;

      await prisma.hojaVida.create({
        data: {
          operarioId: opExiste.id,
          numeroIdentificacion: cedulaFinal,
          direccion,
          formacionAcademica: getRandomItem(formaciones),
          experienciaLaboral: getRandomItem(experiencias)
        }
      });
    }
  }
  console.log('✅ 150 Operarios asegurados con códigos OP-101 al OP-250 y Hojas de Vida completas.');

  // Conteo final verificado
  const [totalUsuarios, totalAdmin, totalAdministrativos, totalSupervisores, totalOperarios, totalHojasVida] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { rol: { nombre: RolNombre.ADMINISTRADOR } } }),
    prisma.usuario.count({ where: { rol: { nombre: RolNombre.ADMINISTRATIVO } } }),
    prisma.supervisor.count(),
    prisma.operario.count(),
    prisma.hojaVida.count()
  ]);

  console.log('\n======================================================');
  console.log('🎉 CENSO DE FUNCIONARIOS REGISTRADOS EN SERVICONTROL:');
  console.log(`👤 Total Usuarios del Sistema : ${totalUsuarios}`);
  console.log(`🔴 Administradores            : ${totalAdmin}`);
  console.log(`🔵 Administrativos            : ${totalAdministrativos} (Meta: 20)`);
  console.log(`🟡 Supervisores               : ${totalSupervisores} (Meta: 30)`);
  console.log(`🟢 Operarios de Campo         : ${totalOperarios} (Meta: 150)`);
  console.log(`📄 Hojas de Vida Registradas  : ${totalHojasVida} (Meta: 150)`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando población de funcionarios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
