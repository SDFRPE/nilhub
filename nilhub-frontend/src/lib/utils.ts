// fronted/src/lib/utils.ts
/**
 * @fileoverview Funciones utilitarias para NilHub
 * @module utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind CSS de manera inteligente
 * 
 * Utiliza clsx para manejar condiciones y tw-merge para
 * resolver conflictos de clases de Tailwind
 * 
 * @param inputs - Clases a combinar (strings, objetos, arrays)
 * @returns String de clases optimizado
 * 
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500')
 * cn('px-2', 'px-4') // → 'px-4' (resuelve conflicto)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}