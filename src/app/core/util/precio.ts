const SIMBOLOS: Record<string, string> = { PEN: 'S/', USD: 'US$' };

/** Formatea un precio como en el modelo: "S/1,299". */
export function formatearPrecio(monto: number, moneda: string): string {
  const simbolo = SIMBOLOS[moneda] ?? moneda;
  return `${simbolo}${monto.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}
