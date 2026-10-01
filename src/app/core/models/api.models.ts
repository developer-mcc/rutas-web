export interface Seccion {
  codigo: string;
  nombre: string;
  tipo: string;
  visible: boolean;
  orden: number;
}

export interface Tour {
  id: number;
  slug: string;
  nombre: string;
  emoji: string | null;
  etiqueta: string | null;
  insignia: string | null;
  descripcion: string;
  resumen: string | null;
  precioDesde: number;
  moneda: string;
  textoPrecio: string | null;
  unidadPrecio: string | null;
  textoPorPersona: string | null;
  imagenUrl: string | null;
  destacado: boolean;
  orden: number;
  activo: boolean;
  inclusiones: string[];
}

export interface Bloque {
  id: number;
  seccionCodigo: string;
  titulo: string;
  texto: string | null;
  icono: string | null;
  imagenUrl: string | null;
  orden: number;
  activo: boolean;
}

export interface Faq {
  id: number;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

/** Mapa clave → valor con todos los textos, imágenes y colores configurables del sitio. */
export type Ajustes = Record<string, string>;

export interface CotizacionRequest {
  tourId: number;
  fechaViaje: string;
  pasajeros: string;
  recojo: string;
}
