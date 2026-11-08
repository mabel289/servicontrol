# GUÍA RÁPIDA DE SUSTENTACIÓN ACADÉMICA - SERVICONTROL
**Taller Práctico de Ingeniería de Software Orientada a Objetos**  
*Guía para defender el proyecto ante el docente con la máxima calificación (5.0)*

---

## 🎯 1. Guion de Demostración Paso a Paso (5 Minutos)

Para demostrar en vivo la aplicación frente a tu profesor, sigue este orden:

### Paso 1: Mostrar los dos servidores corriendo y la documentación OpenAPI
1. Abre tu navegador en `http://localhost:5173` (Frontend) y `http://localhost:4000/api/docs` (Swagger UI).
2. Explica al docente: *"Profesor, el sistema está estructurado como un Monolito Modular por Capas. El backend expone una API REST completamente documentada bajo el estándar OpenAPI 3.0 con Swagger y persistencia en PostgreSQL 17 mediante Prisma ORM"*.

### Paso 2: Autenticación y Control de Acceso por Roles (RBAC)
1. En la pantalla de login (`http://localhost:5173/login`), muestra los botones de acceso rápido que diseñamos para la sustentación.
2. Haz clic en **"Admin: admin@servicontrol.com"** e inicia sesión.
3. Muestra el Navbar con la insignia roja `ADMINISTRADOR` y el Dashboard con los indicadores operativos.

### Paso 3: DEMOSTRACIÓN MÓDULO PRIORITARIO 1 - Programación Semanal y Algoritmo Anti-Solapamiento
1. En el menú superior, haz clic en **"Programación"**.
2. Muestra la tabla de asignaciones de la semana.
3. Haz clic en **"+ Asignar Actividad"**:
   - Selecciona el operario: `[OP-101] Juan Carlos Pérez Morales`.
   - Fecha: La misma fecha donde ya tiene una actividad (ej: `2026-11-10`).
   - Horario: `10:00` a `14:00` (horas que se cruzan con su labor de 08:00 a 12:00).
   - Haz clic en **"Validar y Asignar"**.
4. **Muestra el resultado:** La pantalla mostrará una alerta roja clara con el mensaje del backend:
   > *"Conflicto de horario: El operario Juan Carlos Pérez Morales ya tiene asignada la labor 'Mantenimiento de Piscinas' en 'Torres del Parque' de 08:00 a 12:00 en esta misma fecha."*
5. Explica al profesor: *"Aquí aplicamos el principio de Responsabilidad Única e inversión de dependencias: la regla de negocio de intersección de intervalos se valida en el servicio del backend, garantizando que nunca se produzcan solapamientos en la base de datos relacional"*.

### Paso 4: DEMOSTRACIÓN MÓDULO PRIORITARIO 2 - Operario Offline y Evidencias Fotográficas
1. Cierra sesión como Administrador y haz clic en el botón de acceso rápido **"Operario: operario1@servicontrol.com"**.
2. El sistema redirige automáticamente a la vista móvil simplificada del operario: **Mi Jornada Móvil** (`/operario/jornada`).
3. Muestra el indicador superior: `🟢 Conectado a Internet`.
4. Abre la consola de Chrome DevTools (tecla `F12`), ve a la pestaña **Network** (Red) y selecciona **Offline** (o desconecta el Wi-Fi de tu PC).
5. **Muestra el cambio de estado:** El indicador cambia inmediatamente a `🟠 Sin Conexión (Modo Offline)`.
6. En modo Offline, realiza las siguientes acciones:
   - Haz clic en **"Marcar Entrada"** (se registra en IndexedDB).
   - En la actividad, haz clic en **"Iniciar Actividad"**.
   - Haz clic en **"Capturar"** en la foto de **ANTES** y selecciona una imagen. Muestra cómo el compresor de Canvas API reduce el peso de la imagen en un ~85% instantáneamente y la guarda en IndexedDB.
   - Haz clic en **"Finalizar y Enviar a Supervisión"**.
7. Muestra el botón de sincronización: tiene una insignia roja con el contador de elementos guardados en IndexedDB esperando conexión.
8. En DevTools, vuelve a poner la red en **Online**:
   - El sistema detecta el evento de reconexión y dispara la sincronización automática.
   - El contador vuelve a cero y los datos se transmiten al servidor sin duplicarse gracias al `syncUuid UNIQUE`.

### Paso 5: DEMOSTRACIÓN MÓDULO DE SUPERVISIÓN - Aprobación y Rechazo Obligatorio
1. Cierra sesión y entra como **"Supervisor: supervisor@servicontrol.com"**.
2. Ve a **"Supervisión"** (`/supervision`).
3. Muestra la tarjeta del trabajo pendiente con las fotos del Antes, Durante y Después.
4. Haz clic en **"Rechazar"**: intenta confirmar sin escribir nada.
5. El sistema bloquea la acción indicando que la observación de no conformidad es **obligatoria** (mínimo 10 caracteres).
6. Escribe una observación técnica válida y confirma, o haz clic en **"Aprobar Trabajo"**.

---

## 🎓 2. Preguntas Típicas del Profesor y Cómo Defenderlas

### Pregunta 1: "¿Por qué escogieron un Monolito Modular y no Microservicios?"
**Tu respuesta:**
> *"Profesor, evaluamos microservicios pero los descartamos porque para el volumen de la empresa (aproximadamente 200 usuarios y 150 operarios) introducirían sobrecostos innecesarios de red, latencia y complejidad de transacciones distribuidas. Elegimos un Monolito Modular Organizado por Capas porque mantiene la separación estricta de responsabilidades (controlador, servicio, persistencia) con alta cohesión y bajo acoplamiento, permitiendo transacciones ACID atómicas nativas en PostgreSQL sin fragmentar la base de datos."*

### Pregunta 2: "¿Cómo resolvieron que los operarios no tengan internet en los conjuntos?"
**Tu respuesta:**
> *"Implementamos una arquitectura Offline-First basada en una Progressive Web App (PWA) con IndexedDB en el dispositivo móvil. Toda la programación del día se almacena localmente. Cuando el operario registra su entrada, inicia una labor o captura fotos, los datos y las imágenes comprimidas con Canvas API se persisten primero en IndexedDB con identificadores UUID v4. Al recuperar conectividad, el cliente ejecuta una sincronización por lotes idempotente: la base de datos tiene una restricción UNIQUE sobre el UUID, por lo que ante microcortes o reintentos nunca se duplican registros."*

### Pregunta 3: "¿Dónde y cómo almacenan las fotografías de las evidencias?"
**Tu respuesta:**
> *"Cumplimos con la restricción de ingeniería de no saturar PostgreSQL con datos binarios (BYTEA/BLOB), lo cual degradaría drásticamente el rendimiento de las consultas y multiplicaría el tamaño de las copias de seguridad. Las fotografías se comprimen en el navegador a través de la Canvas API (reduciendo su tamaño en más de un 80%), se transmiten mediante Multer al sistema de archivos local (`/uploads`) y en PostgreSQL únicamente almacenamos los metadatos: ruta relativa, tipo de evidencia (Antes/Durante/Después), peso en bytes, fecha de captura y el UUID de sincronización."*

### Pregunta 4: "¿Qué principios SOLID aplicaron en el código?"
**Tu respuesta:**
> *"Aplicamos los 5 principios:*
> - **SRP (Responsabilidad Única):** El controlador sólo procesa HTTP y códigos de estado; el servicio encapsula las reglas de negocio (como el algoritmo anti-solapamiento de horarios); y Prisma ORM gestiona la persistencia.
> - **OCP (Abierto/Cerrado):** Podemos agregar nuevos tipos de actividades o catálogos sin modificar la lógica existente del motor de asignaciones.
> - **LSP (Sustitución de Liskov):** Implementamos la clase `AppError` que extiende polimórficamente de `Error` de JavaScript, permitiendo al middleware centralizado manejar cualquier excepción operacional de forma transparente.
> - **ISP (Segregación de Interfaces):** Endpoints y contratos separados por rol; el operario no tiene acceso a endpoints de programación ni el supervisor a alterar hojas de vida.
> - **DIP (Inversión de Dependencias):** Los controladores no interactúan directamente con la base de datos ni con el disco; dependen de las abstracciones de los servicios."*

### Pregunta 5: "¿Por qué utilizaron PostgreSQL y no MongoDB?"
**Tu respuesta:**
> *"Porque el negocio de ServiControl exige consistencia inmediata e integridad referencial estricta. El registro de horarios de entrada/salida y la asignación semanal tienen validez legal y laboral. MongoDB ofrece consistencia eventual pero no integridad relacional fuerte mediante Foreign Keys. PostgreSQL 17 nos garantiza transacciones ACID, tipos de datos enum seguros, índices de búsqueda rápida y prevención de registros huérfanos."*

---

## 🔑 3. Credenciales de Prueba Precargadas

| Rol | Correo Electrónico | Contraseña | Perfil y Acceso |
|---|---|---|---|
| **ADMINISTRADOR** | `admin@servicontrol.com` | `Admin1234*` | Acceso total, programación, usuarios, hojas de vida y reportes. |
| **SUPERVISOR** | `supervisor@servicontrol.com` | `Supervisor123*` | Inspección presencial, galería de fotos, aprobación y rechazo de trabajos. |
| **OPERARIO** | `operario1@servicontrol.com` | `Operario123*` | Jornada móvil simplificada, asistencia, ejecución y evidencias offline. |

