/**
 * Validation et sanitization des entrées utilisateur
 * Protection contre les injections et les abus
 */

import { z } from 'zod';

/**
 * Nettoie une chaîne de caractères des caractères dangereux
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer < et > pour éviter XSS
    .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer caractères de contrôle
    .substring(0, 1000); // Limiter la longueur
}

/**
 * Valide un message de symptômes
 */
export const SymptomMessageSchema = z.object({
  message: z
    .string()
    .min(3, 'Le message doit contenir au moins 3 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .refine(
      (val) => {
        // Vérifier qu'il n'y a pas de patterns suspects
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i, // onclick=, onerror=, etc.
          /eval\(/i,
          /expression\(/i,
        ];
        return !suspiciousPatterns.some((pattern) => pattern.test(val));
      },
      { message: 'Le message contient des caractères non autorisés' }
    ),
  language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']),
});

/**
 * Valide un numéro de téléphone sénégalais
 */
export const PhoneNumberSchema = z
  .string()
  .regex(
    /^\+221[0-9]{9}$/,
    'Le numéro doit être au format +221XXXXXXXXX'
  );

/**
 * Valide un email
 */
export const EmailSchema = z
  .string()
  .email('Email invalide')
  .max(255, 'Email trop long');

/**
 * Valide les coordonnées géographiques
 */
export const CoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  longitude: z
    .number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide'),
});

/**
 * Détecte les tentatives d'injection SQL
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
    /(\bAND\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(['"])\s*(OR|AND)\s*\1\s*=\s*\1/i, // ' OR '1'='1
  ];
  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Détecte les tentatives d'injection de commandes
 */
export function detectCommandInjection(input: string): boolean {
  const commandPatterns = [
    /[;&|`$()]/,
    /\.\.\//,
    /\/etc\/passwd/i,
    /\/bin\/(bash|sh)/i,
  ];
  return commandPatterns.some((pattern) => pattern.test(input));
}

/**
 * Valide et nettoie une entrée utilisateur complète
 */
export function validateAndSanitizeInput(input: {
  message: string;
  language: string;
}): { valid: boolean; sanitized?: any; error?: string } {
  try {
    // Vérifier les injections
    if (detectSQLInjection(input.message)) {
      return { valid: false, error: 'Tentative d\'injection SQL détectée' };
    }

    if (detectCommandInjection(input.message)) {
      return { valid: false, error: 'Tentative d\'injection de commande détectée' };
    }

    // Nettoyer et valider
    const sanitized = {
      message: sanitizeString(input.message),
      language: input.language,
    };

    const result = SymptomMessageSchema.safeParse(sanitized);

    if (!result.success) {
      return {
        valid: false,
        error: result.error.errors[0]?.message || 'Validation échouée',
      };
    }

    return { valid: true, sanitized: result.data };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Rate limiting basé sur le contenu pour détecter le spam
 */
export function detectSpam(message: string): boolean {
  // Messages trop courts ou trop longs
  if (message.length < 3 || message.length > 1000) return true;

  // Trop de répétitions du même caractère
  if (/(.)\1{10,}/.test(message)) return true;

  // Trop de majuscules (>80%)
  const upperCount = (message.match(/[A-Z]/g) || []).length;
  if (upperCount / message.length > 0.8) return true;

  // URLs suspectes
  if (/(https?:\/\/|www\.)/gi.test(message)) return true;

  return false;
}
