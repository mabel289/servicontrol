-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('ADMINISTRADOR', 'ADMINISTRATIVO', 'OPERARIO', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "EstadoLaboral" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoProgramacion" AS ENUM ('BORRADOR', 'PUBLICADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoActividad" AS ENUM ('PROGRAMADA', 'EN_PROCESO', 'PENDIENTE_REVISION', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoEvidenciaFoto" AS ENUM ('ANTES', 'DURANTE', 'DESPUES');

-- CreateEnum
CREATE TYPE "EstadoSync" AS ENUM ('PENDIENTE', 'SINCRONIZANDO', 'SINCRONIZADO', 'ERROR');

-- CreateEnum
CREATE TYPE "EstadoRevision" AS ENUM ('APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" "RolNombre" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "rolId" INTEGER NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "codigoInstitucional" TEXT NOT NULL,
    "estadoLaboral" "EstadoLaboral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hojas_vida" (
    "id" TEXT NOT NULL,
    "operarioId" TEXT NOT NULL,
    "numeroIdentificacion" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formacionAcademica" TEXT NOT NULL,
    "experienciaLaboral" TEXT NOT NULL,
    "documentosUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hojas_vida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "codigoSupervisor" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centros_trabajo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Bogotá',
    "telefonoContacto" TEXT,
    "nombreAdministrador" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centros_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_actividad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programaciones_semanales" (
    "id" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoProgramacion" NOT NULL DEFAULT 'BORRADOR',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programaciones_semanales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_actividades" (
    "id" TEXT NOT NULL,
    "programacionId" TEXT NOT NULL,
    "centroTrabajoId" TEXT NOT NULL,
    "operarioId" TEXT NOT NULL,
    "tipoActividadId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicioEstimada" TEXT NOT NULL,
    "horaFinEstimada" TEXT NOT NULL,
    "instrucciones" TEXT,
    "estado" "EstadoActividad" NOT NULL DEFAULT 'PROGRAMADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "operarioId" TEXT NOT NULL,
    "centroTrabajoId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horaEntrada" TIMESTAMP(3) NOT NULL,
    "horaSalida" TIMESTAMP(3),
    "minutosPermanencia" INTEGER,
    "syncUuid" TEXT NOT NULL,
    "estadoSync" "EstadoSync" NOT NULL DEFAULT 'SINCRONIZADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejecuciones_actividades" (
    "id" TEXT NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "horaInicioReal" TIMESTAMP(3) NOT NULL,
    "horaFinReal" TIMESTAMP(3),
    "estado" "EstadoActividad" NOT NULL DEFAULT 'EN_PROCESO',
    "observacionesOperario" TEXT,
    "syncUuid" TEXT NOT NULL,
    "estadoSync" "EstadoSync" NOT NULL DEFAULT 'SINCRONIZADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ejecuciones_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_fotograficas" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "tipoEvidencia" "TipoEvidenciaFoto" NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "pesoBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "fechaCaptura" TIMESTAMP(3) NOT NULL,
    "syncUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_fotograficas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisiones_supervisores" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "estado" "EstadoRevision" NOT NULL,
    "observaciones" TEXT NOT NULL,
    "fechaRevision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisiones_supervisores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operarios_usuarioId_key" ON "operarios"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "operarios_codigoInstitucional_key" ON "operarios"("codigoInstitucional");

-- CreateIndex
CREATE UNIQUE INDEX "hojas_vida_operarioId_key" ON "hojas_vida"("operarioId");

-- CreateIndex
CREATE UNIQUE INDEX "hojas_vida_numeroIdentificacion_key" ON "hojas_vida"("numeroIdentificacion");

-- CreateIndex
CREATE UNIQUE INDEX "supervisores_usuarioId_key" ON "supervisores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "supervisores_codigoSupervisor_key" ON "supervisores"("codigoSupervisor");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_actividad_nombre_key" ON "tipos_actividad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "programaciones_semanales_semana_key" ON "programaciones_semanales"("semana");

-- CreateIndex
CREATE INDEX "asignaciones_actividades_operarioId_fecha_idx" ON "asignaciones_actividades"("operarioId", "fecha");

-- CreateIndex
CREATE INDEX "asignaciones_actividades_centroTrabajoId_fecha_idx" ON "asignaciones_actividades"("centroTrabajoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_syncUuid_key" ON "asistencias"("syncUuid");

-- CreateIndex
CREATE INDEX "asistencias_operarioId_fecha_idx" ON "asistencias"("operarioId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_actividades_asignacionId_key" ON "ejecuciones_actividades"("asignacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_actividades_syncUuid_key" ON "ejecuciones_actividades"("syncUuid");

-- CreateIndex
CREATE UNIQUE INDEX "evidencias_fotograficas_syncUuid_key" ON "evidencias_fotograficas"("syncUuid");

-- CreateIndex
CREATE INDEX "evidencias_fotograficas_ejecucionId_tipoEvidencia_idx" ON "evidencias_fotograficas"("ejecucionId", "tipoEvidencia");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operarios" ADD CONSTRAINT "operarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hojas_vida" ADD CONSTRAINT "hojas_vida_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "operarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisores" ADD CONSTRAINT "supervisores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividades" ADD CONSTRAINT "asignaciones_actividades_programacionId_fkey" FOREIGN KEY ("programacionId") REFERENCES "programaciones_semanales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividades" ADD CONSTRAINT "asignaciones_actividades_centroTrabajoId_fkey" FOREIGN KEY ("centroTrabajoId") REFERENCES "centros_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividades" ADD CONSTRAINT "asignaciones_actividades_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "operarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividades" ADD CONSTRAINT "asignaciones_actividades_tipoActividadId_fkey" FOREIGN KEY ("tipoActividadId") REFERENCES "tipos_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "operarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_centroTrabajoId_fkey" FOREIGN KEY ("centroTrabajoId") REFERENCES "centros_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones_actividades" ADD CONSTRAINT "ejecuciones_actividades_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_fotograficas" ADD CONSTRAINT "evidencias_fotograficas_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisiones_supervisores" ADD CONSTRAINT "revisiones_supervisores_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisiones_supervisores" ADD CONSTRAINT "revisiones_supervisores_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
