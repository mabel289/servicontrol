import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importación de estilos globales y Bootstrap 5
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

