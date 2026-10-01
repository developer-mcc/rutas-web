export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  rol: string;
}

/** Sesión guardada en sessionStorage; se pierde al cerrar la pestaña. */
export interface Sesion {
  token: string;
  username: string;
  nombreCompleto: string;
  expiraEn: number;
}

export interface TourRequest {
  slug: string;
  nombre: string;
  emoji: string;
  etiqueta: string;
  insignia: string;
  descripcion: string;
  resumen: string;
  precioDesde: number;
  moneda: string;
  textoPrecio: string;
  unidadPrecio: string;
  textoPorPersona: string;
  imagenUrl: string;
  destacado: boolean;
  orden: number;
  activo: boolean;
  inclusiones: string[];
}

export interface FaqRequest {
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

export interface SeccionRequest {
  nombre: string;
  visible: boolean;
  orden: number;
}

export interface BloqueRequest {
  seccionCodigo: string;
  titulo: string;
  texto: string;
  icono: string;
  imagenUrl: string;
  orden: number;
  activo: boolean;
}

export type TipoAjuste = 'TEXTO' | 'TEXTO_LARGO' | 'IMAGEN' | 'COLOR' | 'ENLACE';

export interface AjusteAdmin {
  clave: string;
  valor: string | null;
  tipo: TipoAjuste;
  grupo: string;
  etiqueta: string;
  orden: number;
}

export interface CambioAjuste {
  clave: string;
  valor: string;
}

export interface CotizacionAdmin {
  id: number;
  tourId: number | null;
  tourNombre: string;
  fechaViaje: string;
  pasajeros: string;
  recojo: string;
  atendida: boolean;
  creadaEn: string;
}

export interface ImagenSubida {
  url: string;
}

/** Datos personales y auditoría de una persona (GET /api/admin/perfil). */
export interface PersonaPerfil {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  tipoDocumento: string | null;
  numeroDocumento: string | null;
  email: string | null;
  telefono: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

/** Perfil completo del usuario autenticado: cuenta, rol, datos personales y metadatos. */
export interface Perfil {
  id: number;
  username: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  persona: PersonaPerfil;
}

/** Datos personales editables del perfil (PUT /api/admin/perfil). */
export interface PerfilRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: string | null;
  numeroDocumento: string;
  email: string;
  telefono: string;
}
