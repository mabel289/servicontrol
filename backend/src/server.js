import app from './app.js';
import { env } from './config/environment.js';

const server = app.listen(env.port, () => {
  console.log(`=========================================`);
  console.log(`🚀 ServiControl API iniciada exitosamente`);
  console.log(`📡 Puerto: http://localhost:${env.port}`);
  console.log(`🌍 Entorno: ${env.nodeEnv}`);
  console.log(`🔍 Health Check: http://localhost:${env.port}/api/health`);
  console.log(`=========================================`);
});

// Manejo elegante de apagado del servidor (Graceful shutdown)
const gracefulShutdown = (signal) => {
  console.log(`\nRecibida señal ${signal}. Cerrando servidor HTTP...`);
  server.close(() => {
    console.log('Servidor HTTP cerrado. Proceso finalizado limpiamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

