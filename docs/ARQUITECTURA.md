# DOCUMENTO DE ARQUITECTURA DE SOFTWARE - SERVICONTROL
**Sistema de Gestión y Seguimiento de Servicios Locativos**  
*Taller Práctico de Ingeniería de Software Orientada a Objetos*

---

## 1. Atributos de Calidad Priorizados

| Atributo | Métrica / Requisito | Justificación en el Problema |
|---|---|---|
| **Disponibilidad / Resiliencia (Offline)** | Funcionamiento 100% operativo sin internet en dispositivos de operarios. RTO = 0 para captura de datos en campo. | Los operarios laboran en sótanos, zonas comunes o conjuntos sin cobertura ni Wi-Fi. |
| **Tiempo de Respuesta** | $\le 200\text{ ms}$ en API REST local/servidor; operaciones locales en IndexedDB $\le 30\text{ ms}$. | Celulares de gama media/baja deben tener una experiencia ágil y fluida. |
| **Seguridad y Cifrado** | Cifrado unidireccional de contraseñas con `bcrypt` (cost factor 10), autenticación sin estado con tokens JWT de 8 horas y autorización RBAC en dos capas. | Protección de datos laborales, evidencias y roles diferenciados (Admin, Supervisor, Operario). |
| **Integridad de Datos** | Cero pérdida de evidencias fotográficas; operaciones de sincronización idempotentes con UUID v4. | La información pendiente nunca debe destruirse ni duplicarse ante fallos de conexión. |

---

## 2. Limitaciones Técnicas y de Negocio

- **Limitación de Red:** Ausencia total de conectividad de datos móviles en los operarios y restricción de acceso al Wi-Fi de los conjuntos cerrados.
- **Limitación de Hardware:** Los operarios no cuentan con equipos empresariales; utilizan sus propios teléfonos móviles personales de gama baja o media.
- **Limitación de Almacenamiento:** No almacenar binarios de imágenes directamente en PostgreSQL (se almacenan en sistema de archivos y metadatos en BD relacional).
- **Limitación Operativa:** Turnos estrictos de lunes a viernes con asignación semanal previa y validación obligatoria contra solapamiento de horarios.

---

## 3. Diagrama de Casos de Uso del Sistema

```mermaid
flowchart LR
    Admin([Administrador / Administrativo])
    Operario([Operario])
    Supervisor([Supervisor])

    subgraph ServiControl["Sistema ServiControl"]
        CU1(Gestionar Usuarios y Hojas de Vida)
        CU2(Administrar Centros de Trabajo / Conjuntos)
        CU3(Elaborar Programación Semanal)
        CU4(Registrar Asistencia Entrada / Salida)
        CU5(Iniciar y Finalizar Actividades)
        CU6(Capturar Evidencias Antes / Durante / Después)
        CU7(Sincronizar Datos Offline)
        CU8(Revisar, Aprobar o Rechazar Actividades)
        CU9(Generar Reportes e Indicadores)
    end

    Admin --> CU1
    Admin --> CU2
    Admin --> CU3
    Admin --> CU9

    Operario --> CU4
    Operario --> CU5
    Operario --> CU6
    Operario --> CU7

    Supervisor --> CU8
    Supervisor --> CU9
```

---

## 4. Descripción de Escenarios Críticos (Top 3 de Mayor Impacto)

1. **Escenario Crítico 1: Jornada Completa Desconectada (Offline-First Resiliency)**
   - *Estímulo:* El operario ingresa a un conjunto residencial sin señal celular y ejecuta 3 actividades.
   - *Impacto:* La aplicación móvil web debe registrar la entrada, inicio, fotos comprimidas (antes, durante, después) y finalización en **IndexedDB**, garantizando persistencia local íntegra sin fallos por falta de red.
2. **Escenario Crítico 2: Sincronización Idempotente y Concurrente por Lotes**
   - *Estímulo:* 150 operarios recuperan conectividad simultáneamente al salir de los conjuntos residenciales a las 5:00 PM y sus dispositivos inician sincronización automática.
   - *Impacto:* El endpoint de sincronización del backend debe procesar lotes con identificadores UUID generados en el cliente, evitando duplicidad de asistencias o evidencias fotográficas aunque se reintente la petición por microcortes.
3. **Escenario Crítico 3: Validación Anti-Solapamiento en la Programación Semanal**
   - *Estímulo:* El administrador asigna múltiples actividades a un operario en diferentes conjuntos residenciales durante la misma semana.
   - *Impacto:* La capa de servicios debe evaluar los intervalos $[h_{inicio}, h_{fin}]$ para asegurar que ningún operario tenga doble asignación simultánea, garantizando la consistencia del horario laboral.

---

## 5. Estilo Arquitectónico: Monolito Modular por Capas

### Justificación de la Elección
Se selecciona el estilo **Monolito Modular Organizado por Capas** por las siguientes razones:
- **Alta Cohesión y Bajo Acoplamiento:** Cada módulo funcional (`auth`, `programacion`, `asistencia`, `ejecucion`, `evidencias`) encapsula su controlador, servicio y repositorio, evitando el "código espagueti".
- **Simplicidad de Despliegue y Mantenimiento:** Para el volumen de la empresa (aproximadamente 200 usuarios totales) y la sustentación académica, una arquitectura de microservicios añadiría sobrecostos de red, latencia y complejidad distribuida innecesaria.
- **Cumplimiento de Principios SOLID:**
  - **SRP (Single Responsibility):** El controlador solo atiende HTTP, el servicio orquesta reglas de negocio y el repositorio encapsula el acceso a datos.
  - **DIP (Dependency Inversion):** Los servicios dependen de abstracciones y repositorios, no de implementaciones directas de bajo nivel.

---

## 6. Diagrama de Componentes / Paquetes

```mermaid
flowchart TD
    subgraph Frontend["Frontend (React + Vite PWA)"]
        UI[Componentes UI / Vistas]
        Routing[React Router con Guardias de Rol]
        Context[AuthContext & ConnectivityContext]
        OfflineEngine[Motor Offline: IndexedDB + Queue]
        ApiClient[Axios Client con Interceptores]
    end

    subgraph Backend["Backend (Node.js + Express API REST)"]
        Routes[Enrutador Modular]
        Middlewares[Auth JWT, Roles RBAC, ErrorHandler]
        Controllers[Controladores por Módulo]
        Services[Servicios de Dominio y Negocio]
        Repositories[Capa de Persistencia / Prisma ORM]
        Infra[Infraestructura: Storage de Archivos & Mailer]
    end

    subgraph StorageLayer["Capa de Datos y Persistencia"]
        Postgres[(PostgreSQL 17 Relacional)]
        FileSystem[(Sistema de Archivos: /uploads Fotos)]
    end

    UI --> Routing
    UI --> Context
    UI --> OfflineEngine
    OfflineEngine --> ApiClient
    ApiClient -->|HTTP REST / JSON / FormData| Routes
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> Services
    Services --> Repositories
    Services --> Infra
    Repositories --> Postgres
    Infra --> FileSystem
```

---

## 7. Diagrama Entidad-Relación (BD Relacional en PostgreSQL)

```mermaid
erDiagram
    ROL ||--o{ USUARIO : tiene
    USUARIO ||--o| OPERARIO : perfil_operario
    USUARIO ||--o| SUPERVISOR : perfil_supervisor
    OPERARIO ||--|| HOJA_VIDA : posee
    
    CENTRO_TRABAJO ||--o{ ASIGNACION_ACTIVIDAD : recibe
    CENTRO_TRABAJO ||--o{ ASISTENCIA : registra
    OPERARIO ||--o{ ASISTENCIA : marca
    OPERARIO ||--o{ ASIGNACION_ACTIVIDAD : realiza
    
    PROGRAMACION_SEMANAL ||--o{ ASIGNACION_ACTIVIDAD : contiene
    TIPO_ACTIVIDAD ||--o{ ASIGNACION_ACTIVIDAD : categoriza
    
    ASIGNACION_ACTIVIDAD ||--o| EJECUCION_ACTIVIDAD : ejecuta
    EJECUCION_ACTIVIDAD ||--o{ EVIDENCIA_FOTOGRAFICA : documenta
    EJECUCION_ACTIVIDAD ||--o{ REVISION_SUPERVISOR : evaluada_por
    SUPERVISOR ||--o{ REVISION_SUPERVISOR : emite

    ROL {
        int id PK
        string nombre UK
        string descripcion
    }

    USUARIO {
        string id PK
        string email UK
        string password
        string nombres
        string apellidos
        string telefono
        boolean activo
        int rolId FK
    }

    OPERARIO {
        string id PK
        string usuarioId FK,UK
        string codigoInstitucional UK
        enum estadoLaboral
    }

    HOJA_VIDA {
        string id PK
        string operarioId FK,UK
        string numeroIdentificacion UK
        string direccion
        datetime fechaIngreso
        text formacionAcademica
        text experienciaLaboral
    }

    SUPERVISOR {
        string id PK
        string usuarioId FK,UK
        string codigoSupervisor UK
        boolean activo
    }

    CENTRO_TRABAJO {
        string id PK
        string nombre
        string direccion
        string ciudad
        string telefonoContacto
        string nombreAdministrador
        boolean activo
    }

    TIPO_ACTIVIDAD {
        int id PK
        string nombre UK
        string descripcion
        boolean activo
    }

    PROGRAMACION_SEMANAL {
        string id PK
        string semana UK
        datetime fechaInicio
        datetime fechaFin
        enum estado
    }

    ASIGNACION_ACTIVIDAD {
        string id PK
        string programacionId FK
        string centroTrabajoId FK
        string operarioId FK
        int tipoActividadId FK
        date fecha
        string horaInicioEstimada
        string horaFinEstimada
        text instrucciones
        enum estado
    }

    ASISTENCIA {
        string id PK
        string operarioId FK
        string centroTrabajoId FK
        date fecha
        datetime horaEntrada
        datetime horaSalida
        int minutosPermanencia
        string syncUuid UK
        enum estadoSync
    }

    EJECUCION_ACTIVIDAD {
        string id PK
        string asignacionId FK,UK
        datetime horaInicioReal
        datetime horaFinReal
        enum estado
        string syncUuid UK
    }

    EVIDENCIA_FOTOGRAFICA {
        string id PK
        string ejecucionId FK
        enum tipoEvidencia
        string urlArchivo
        int pesoBytes
        string syncUuid UK
        datetime fechaCaptura
    }

    REVISION_SUPERVISOR {
        string id PK
        string ejecucionId FK
        string supervisorId FK
        enum estado
        text observaciones
        datetime fechaRevision
    }
```

---

## 8. Justificación de PostgreSQL
- **Garantía ACID Estricta:** La programación semanal, los registros de asistencia legal y el estado de los trabajos requieren consistencia inmediata y transacciones atómicas.
- **Integridad Referencial Fuerte:** Claves foráneas que impiden estados inválidos (ej. una evidencia huérfana sin actividad).
- **Soporte de Índices Compuestos:** Búsquedas rápidas en rangos de fechas y estados de sincronización.
- **Tipos de Datos Nativos y Extensiones:** UUIDs nativos, Timestamps con zona horaria (`timestamptz`) y tipos `enum` seguros.

---

## 9. Diagrama de Despliegue Local

```mermaid
flowchart TB
    subgraph DispositivoOperario["Dispositivo Móvil / Navegador (Operario)"]
        BrowserApp["PWA Localhost:5173\n(HTML5, React, Bootstrap)"]
        LocalDB["IndexedDB (Almacenamiento Local Offline)"]
        BrowserApp <--> LocalDB
    end

    subgraph PC_Servidor["Servidor de Desarrollo Local (Windows)"]
        ViteDev["Vite Dev Server\nPuerto 5173"]
        NodeAPI["Node.js / Express API REST\nPuerto 4000"]
        PrismaORM["Prisma Client Engine"]
        PostgresSrv["Servicio PostgreSQL 17\nPuerto 5432"]
        DiskUploads["Directorio /uploads\n(Imágenes comprimidas)"]

        ViteDev -.->|Proxy /api| NodeAPI
        NodeAPI --> PrismaORM
        PrismaORM --> PostgresSrv
        NodeAPI --> DiskUploads
    end

    BrowserApp -->|HTTP REST / JWT| NodeAPI
```

---

## 10. Tecnologías Utilizadas

- **Frontend:** React 18, Vite 6, Bootstrap 5, Bootstrap Icons, React Router v7, Axios, `idb` (IndexedDB).
- **Backend:** Node.js 22 LTS, Express 5, CORS, Multer (archivos), BcryptJS, JSON Web Tokens (JWT), Zod.
- **Base de Datos & ORM:** PostgreSQL 17, Prisma ORM.
- **Herramientas de Entorno:** VS Code, Git, pgAdmin 4.

---

## 11. Decisiones Arquitectónicas Críticas

| # | Problema Encontrado | Opciones Evaluadas | Opción Seleccionada | Justificación Técnica |
|---|---|---|---|---|
| **D1** | Operarios sin cobertura celular ni Wi-Fi en conjuntos cerrados. | 1. Exigir plan de datos empresarial.<br>2. Aplicación móvil nativa en Java/Kotlin.<br>3. PWA con Service Worker e IndexedDB. | **PWA con IndexedDB** | Los operarios usan sus propios celulares (gama baja/media). PWA no requiere instalación por tienda, es multiplataforma y IndexedDB soporta almacenamiento local de fotos y cola de sincronización. |
| **D2** | Almacenamiento de evidencias fotográficas en alta resolución. | 1. Guardar Base64/BYTEA en PostgreSQL.<br>2. Sistema de archivos local + metadatos en BD.<br>3. Cloud Storage (AWS S3). | **Sistema de archivos local + Metadatos en PostgreSQL** | Guardar binarios en BD degrada severamente el rendimiento de las consultas y satura los backups. El almacenamiento en disco con compresión cliente optimiza espacio y PostgreSQL solo guarda URLs y metadatos. |
| **D3** | Prevención de duplicados en la sincronización tras cortes de red. | 1. Auto-incrementales del servidor.<br>2. Identificadores UUID v4 generados en el cliente con upsert. | **UUID v4 cliente + Sincronización Idempotente** | Al generarse el UUID en el dispositivo desconectado, reintentar una sincronización fallida no crea duplicados en el servidor gracias a la restricción `UNIQUE (uuid)`. |

