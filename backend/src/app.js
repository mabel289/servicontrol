import express from 'express';
import cors from 'cors';
import { env } from './config/environment.js';
import { AppError } from './utils/appError.js';
import { errorHandler } from './middlewares/errorHandler.js';

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

// Endpoint de verificación del estado del sistema (Health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      sistema: 'ServiControl API',
      version: '1.0.0',
      entorno: env.nodeEnv,
      tiempoActivoSegundos: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
