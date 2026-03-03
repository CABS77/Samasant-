import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  detectSQLInjection,
  detectCommandInjection,
  validateAndSanitizeInput,
  detectSpam,
} from '@/lib/inputValidation';
import {
  checkRateLimit,
  resetRateLimit,
  generateRateLimitIdentifier,
} from '@/lib/rateLimitServer';

describe('Input Validation', () => {
  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = sanitizeString(input);
      expect(result).toBe('test');
    });

    it('should limit length to 1000 characters', () => {
      const input = 'a'.repeat(2000);
      const result = sanitizeString(input);
      expect(result.length).toBe(1000);
    });
  });

  describe('detectSQLInjection', () => {
    it('should detect SQL injection attempts', () => {
      expect(detectSQLInjection("' OR '1'='1")).toBe(true);
      expect(detectSQLInjection('SELECT * FROM users')).toBe(true);
      expect(detectSQLInjection('DROP TABLE users')).toBe(true);
      expect(detectSQLInjection('UNION SELECT password')).toBe(true);
    });

    it('should allow normal text', () => {
      expect(detectSQLInjection('J\'ai mal à la tête')).toBe(false);
      expect(detectSQLInjection('Je me sens fatigué')).toBe(false);
    });
  });

  describe('detectCommandInjection', () => {
    it('should detect command injection attempts', () => {
      expect(detectCommandInjection('test; rm -rf /')).toBe(true);
      expect(detectCommandInjection('test && cat /etc/passwd')).toBe(true);
      expect(detectCommandInjection('test | ls')).toBe(true);
      expect(detectCommandInjection('../../../etc/passwd')).toBe(true);
    });

    it('should allow normal text', () => {
      expect(detectCommandInjection('J\'ai de la fièvre')).toBe(false);
      expect(detectCommandInjection('Douleur abdominale')).toBe(false);
    });
  });

  describe('validateAndSanitizeInput', () => {
    it('should validate and sanitize correct input', () => {
      const input = {
        message: 'J\'ai mal à la tête depuis 2 jours',
        language: 'french',
      };
      const result = validateAndSanitizeInput(input);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBeDefined();
    });

    it('should reject SQL injection', () => {
      const input = {
        message: "' OR '1'='1",
        language: 'french',
      };
      const result = validateAndSanitizeInput(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('injection');
    });

    it('should reject too short messages', () => {
      const input = {
        message: 'ab',
        language: 'french',
      };
      const result = validateAndSanitizeInput(input);
      expect(result.valid).toBe(false);
    });
  });

  describe('detectSpam', () => {
    it('should detect spam patterns', () => {
      expect(detectSpam('aaaaaaaaaaaaaaaaaaa')).toBe(true); // Répétitions
      expect(detectSpam('SPAM SPAM SPAM SPAM')).toBe(true); // Trop de majuscules
      expect(detectSpam('Visit https://spam.com')).toBe(true); // URLs
      expect(detectSpam('ab')).toBe(true); // Trop court
    });

    it('should allow normal messages', () => {
      expect(detectSpam('J\'ai de la fièvre et des maux de tête')).toBe(false);
      expect(detectSpam('Je tousse depuis 3 jours')).toBe(false);
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Réinitialiser le rate limit avant chaque test
    resetRateLimit('test-user');
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = checkRateLimit('test-user', 3);
      expect(result1.limited).toBe(false);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit('test-user', 3);
      expect(result2.limited).toBe(false);
      expect(result2.remaining).toBe(1);
    });

    it('should block requests exceeding limit', () => {
      checkRateLimit('test-user', 2);
      checkRateLimit('test-user', 2);
      const result = checkRateLimit('test-user', 2);
      
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should reset after time window', async () => {
      const windowMs = 100; // 100ms pour le test
      checkRateLimit('test-user', 1, windowMs);
      checkRateLimit('test-user', 1, windowMs);
      
      // Attendre que la fenêtre expire
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const result = checkRateLimit('test-user', 1, windowMs);
      expect(result.limited).toBe(false);
    });
  });

  describe('generateRateLimitIdentifier', () => {
    it('should prioritize userId', () => {
      const id = generateRateLimitIdentifier('1.2.3.4', 'user123', 'device456');
      expect(id).toBe('user:user123');
    });

    it('should use deviceId if no userId', () => {
      const id = generateRateLimitIdentifier('1.2.3.4', undefined, 'device456');
      expect(id).toBe('device:device456');
    });

    it('should use IP if no userId or deviceId', () => {
      const id = generateRateLimitIdentifier('1.2.3.4', undefined, undefined);
      expect(id).toBe('ip:1.2.3.4');
    });

    it('should return anonymous if nothing provided', () => {
      const id = generateRateLimitIdentifier(undefined, undefined, undefined);
      expect(id).toBe('anonymous');
    });
  });
});
