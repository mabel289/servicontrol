import express from 'express';
import cors from 'cors';
import { env } from './config/environment.js';
import { AppError } from './utils/appError.js';
import { errorHandler } from './middlewares/errorHandler.js';
import prisma from './database/prisma.js';

// Importación de rutas modulares
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';

const app = express();

// Configuración de CORS
const allowedOrigins = [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como Postman o curl) o de dominios autorizados
    if (!origin || allowedOrigins.includes(origin)) {
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

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
