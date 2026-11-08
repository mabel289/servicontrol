import express from 'express';
import cors from 'cors';
import { env } from './config/environment.js';
import { AppError } from './utils/appError.js';
import { errorHandler } from './middlewares/errorHandler.js';
import prisma from './database/prisma.js';

// Importación de rutas modulares
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import centrosTrabajoRoutes from './modules/centros-trabajo/centros-trabajo.routes.js';
import operariosRoutes from './modules/operarios/operarios.routes.js';
import programacionRoutes from './modules/programacion/programacion.routes.js';
import asistenciaRoutes from './modules/asistencia/asistencia.routes.js';
import ejecucionRoutes from './modules/ejecucion/ejecucion.routes.js';
import evidenciasRoutes from './modules/evidencias/evidencias.routes.js';
import sincronizacionRoutes from './modules/sincronizacion/sincronizacion.routes.js';
import supervisionRoutes from './modules/supervision/supervision.routes.js';
import reportesRoutes from './modules/reportes/reportes.routes.js';

// Documentación OpenAPI / Swagger
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Configuración de CORS
const allowedOrigins = [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
const localIpRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    // Permitir en desarrollo, red local, Vercel o dominios autorizados
    if (
      !origin ||
      env.isDev ||
      allowedOrigins.includes(origin) ||
      localIpRegex.test(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(new AppError('No permitido por la política de CORS', 403));
    }
  },
  credentials: true
}));

// Middlewares para procesar cuerpos JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Carpeta pública para archivos estáticos (uploads de evidencias fotográficas)
app.use('/uploads', express.static('uploads'));

// Documentación interactiva Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint de verificación del estado del sistema y la base de datos (Health check)
app.get('/api/health', async (req, res, next) => {
  try {
    // Comprobar conexión viva con PostgreSQL mediante Prisma
    const [rolesCount, usuariosCount] = await Promise.all([
      prisma.rol.count(),
      prisma.usuario.count()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        sistema: 'ServiControl API',
        version: '1.0.0',
        entorno: env.nodeEnv,
        tiempoActivoSegundos: Math.floor(process.uptime()),
        baseDatos: {
          motor: 'PostgreSQL 17',
          orm: 'Prisma 6',
          estado: 'CONECTADO',
          rolesRegistrados: rolesCount,
          usuariosRegistrados: usuariosCount
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(new AppError(`Error conectando con la base de datos: ${error.message}`, 500));
  }
});

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/centros-trabajo', centrosTrabajoRoutes);
app.use('/api/operarios', operariosRoutes);
app.use('/api/programacion', programacionRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/ejecucion', ejecucionRoutes);
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/sincronizacion', sincronizacionRoutes);
app.use('/api/supervision', supervisionRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
