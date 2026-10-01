/** Forma común de los archivos de entorno (local y producción). */
export interface Entorno {
  production: boolean;
  /** Dirección base de la API sin barra final; vacía cuando se usa el proxy local o el mismo origen. */
  apiUrl: string;
}
