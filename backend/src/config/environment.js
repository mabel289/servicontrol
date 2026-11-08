/**
 * Configuración centralizada de variables de entorno del sistema ServiControl.
 * Aplica el principio de Responsabilidad Única (SRP) aislando la lectura de process.env.
 */
export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};

