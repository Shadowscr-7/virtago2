/**
 * Tipos compartidos para el sistema de matching de productos.
 *
 * El matching se ejecuta en el servidor vía POST /api/products/match
 * usando algoritmos locales (sin OpenAI). Este archivo solo exporta tipos.
 */

export interface MatchResult {
  matched: boolean;
  matchedId?: string;
  matchedName?: string;
  confidence: number;
  shouldCreate: boolean;
  reason?: string;
}
