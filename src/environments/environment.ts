import { Entorno } from './entorno';

/**
 * Entorno LOCAL (ng serve). La dirección de la API va vacía: las llamadas son relativas (/api/...)
 * y proxy.conf.json las reenvía a http://localhost:8080. El build de producción reemplaza este
 * archivo por environment.production.ts (ver fileReplacements en angular.json).
 */
export const environment: Entorno = {
  production: false,
  apiUrl: '',
};
