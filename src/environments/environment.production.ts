import { Entorno } from './entorno';

/**
 * Entorno de PRODUCCIÓN (ng build). La API vive en otro servicio de Render, así que aquí va su
 * dirección completa, sin barra final. Si la API recibe otro nombre en Render, cámbiala aquí.
 * En la API debe estar CORS_ORIGINS con la dirección de este sitio.
 */
export const environment: Entorno = {
  production: true,
  apiUrl: 'https://rutas-api-5o3j.onrender.com',
};
