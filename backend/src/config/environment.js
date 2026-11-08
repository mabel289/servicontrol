/**
 * Configuración centralizada de variables de entorno del sistema ServiControl.
 * Aplica el principio de Responsabilidad Única (SRP) aislando la lectura de process.env.
 */
export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h'
};
