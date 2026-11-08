import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../utils/appError.js';

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const randomId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `evidencia_${Date.now()}_${randomId}${ext}`);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato no permitido. Solo se aceptan fotografías JPEG, PNG o WebP', 400), false);
  }
};

export const uploadFoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Máximo 10 MB
  }
});
