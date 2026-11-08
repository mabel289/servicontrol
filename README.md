# ServiControl 🏢🛠️

Sistema de Gestión y Seguimiento de Servicios Locativos para Conjuntos Residenciales.  
Proyecto desarrollado bajo los principios de **Ingeniería de Software Orientada a Objetos**.

---

## 🏗️ Estructura del Proyecto

- `backend/`: API REST modular con Node.js, Express y persistencia PostgreSQL vía Prisma ORM.
- `frontend/`: Aplicación cliente responsiva construida con React, Vite y Bootstrap 5, preparada para PWA e IndexedDB.
- `docs/`: Documento formal de Arquitectura de Software con los 11 puntos solicitados en la rúbrica del taller.

---

## 🚀 Puesta en Marcha Rápida (Local)

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm run dev
```
El servidor backend se iniciará en `http://localhost:4000` con su endpoint de comprobación en `http://localhost:4000/api/health`.

### 2. Iniciar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`.

