import { PrismaClient } from '@prisma/client';
import { env } from '../config/environment.js';

/**
 * Patrón Singleton para el cliente de base de datos Prisma.
 * Garantiza una única instancia compartida del pool de conexiones a PostgreSQL,
 * previniendo agotamiento de sockets en entornos de desarrollo y producción.
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo se reutiliza la instancia para evitar múltiples conexiones con recarga en caliente
  if (!global.__prismaInstance) {
    global.__prismaInstance = new PrismaClient({
      log: env.isDev ? ['query', 'info', 'warn', 'error'] : ['error']
    });
  }
  prisma = global.__prismaInstance;
}

export default prisma;

