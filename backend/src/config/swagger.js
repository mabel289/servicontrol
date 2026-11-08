import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ServiControl API REST',
      version: '1.0.0',
      description: 'Documentación interactiva de endpoints para el Sistema de Gestión y Seguimiento de Servicios Locativos. Proyecto del Taller de Ingeniería de Software Orientada a Objetos.',
      contact: {
        name: 'Equipo de Desarrollo ServiControl',
        email: 'soporte@servicontrol.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
        description: 'Servidor Local de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT emitido por /api/auth/login'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/modules/**/*.js', './src/app.js']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

