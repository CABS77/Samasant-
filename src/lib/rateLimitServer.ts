/**
 * Server-side rate limiting pour sécuriser les appels API
 * Utilise une Map en mémoire (à remplacer par Redis en production)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Cache en mémoire pour le rate limiting
// En production, utiliser Redis ou une solution distribuée
const rateLimitCache = new Map<string, RateLimitEntry>();

// Nettoyage automatique des entrées expirées toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitCache.entries()) {
    if (entry.resetTime < now) {
      rateLimitCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1 heure

/**
 * Vérifie si une requête dépasse la limite autorisée
 * 
 * @param identifier - Identifiant unique (IP, user ID, device ID)
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowMs - Fenêtre de temps en millisecondes (par défaut 24h)
 * @returns true si la limite est atteinte, false sinon
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 7,
  windowMs: number = 24 * 60 * 60 * 1000 // 24 heures par défaut
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  // Si pas d'entrée ou entrée expirée, créer une nouvelle
  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitCache.set(identifier, { count: 1, resetTime });
    return { limited: false, remaining: maxRequests - 1, resetTime };
  }

  // Incrémenter le compteur
  entry.count++;
  rateLimitCache.set(identifier, entry);

  // Vérifier si la limite est atteinte
  const remaining = Math.max(0, maxRequests - entry.count);
  const limited = entry.count > maxRequests;

  return { limited, remaining, resetTime: entry.resetTime };
}

/**
 * Réinitialise le compteur pour un identifiant donné
 * Utile pour les tests ou les cas exceptionnels
 */
export function resetRateLimit(identifier: string): void {
  rateLimitCache.delete(identifier);
}

/**
 * Obtient les statistiques de rate limiting pour un identifiant
 */
export function getRateLimitStats(identifier: string): {
  count: number;
  resetTime: number;
} | null {
  const entry = rateLimitCache.get(identifier);
  if (!entry || entry.resetTime < Date.now()) {
    return null;
  }
  return { count: entry.count, resetTime: entry.resetTime };
}

/**
 * Génère un identifiant unique basé sur plusieurs facteurs
 * pour éviter le contournement facile du rate limiting
 */
export function generateRateLimitIdentifier(
  ip?: string,
  userId?: string,
  deviceId?: string
): string {
  // Priorité : userId > deviceId > IP
  if (userId) return `user:${userId}`;
  if (deviceId) return `device:${deviceId}`;
  if (ip) return `ip:${ip}`;
  return 'anonymous';
}
