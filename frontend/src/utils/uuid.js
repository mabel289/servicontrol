/**
 * Generador seguro de UUID v4 con compatibilidad multiplataforma.
 * Utiliza crypto.randomUUID cuando está disponible (contextos seguros HTTPS/localhost)
 * y provee un fallback RFC4122 para entornos HTTP en red local (ej: celulares en http://192.168.x.x).
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback seguro compatible con cualquier navegador móvil
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

