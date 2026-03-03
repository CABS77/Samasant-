/**
 * Utilitaires de chiffrement pour les données sensibles
 * Utilise Web Crypto API (disponible dans les navigateurs modernes et Node.js)
 */

/**
 * Génère une clé de chiffrement à partir d'une passphrase
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Chiffre des données sensibles
 * @param data - Données à chiffrer
 * @param passphrase - Phrase secrète (utiliser une variable d'environnement)
 * @returns Données chiffrées en base64
 */
export async function encryptData(data: string, passphrase: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(data)
    );

    // Combiner salt + iv + données chiffrées
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convertir en base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Déchiffre des données
 * @param encryptedData - Données chiffrées en base64
 * @param passphrase - Phrase secrète
 * @returns Données déchiffrées
 */
export async function decryptData(
  encryptedData: string,
  passphrase: string
): Promise<string> {
  try {
    // Décoder depuis base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extraire salt, iv et données chiffrées
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveKey(passphrase, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash une chaîne de caractères (pour les mots de passe, etc.)
 * @param data - Données à hasher
 * @returns Hash en hexadécimal
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Génère un token aléatoire sécurisé
 * @param length - Longueur du token en octets
 * @returns Token en hexadécimal
 */
export function generateSecureToken(length: number = 32): string {
  const buffer = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Masque les données sensibles pour les logs
 * @param data - Données à masquer
 * @param visibleChars - Nombre de caractères visibles au début et à la fin
 * @returns Données masquées
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - visibleChars * 2);
  return `${start}${masked}${end}`;
}
