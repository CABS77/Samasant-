import { NextRequest, NextResponse } from 'next/server';
import { initialHealthAssessment } from '@/ai/flows/initial-health-assessment';
import { checkRateLimit, generateRateLimitIdentifier } from '@/lib/rateLimitServer';
import { validateAndSanitizeInput, detectSpam } from '@/lib/inputValidation';
import { z } from 'zod';

// Schéma de validation des entrées
const RequestSchema = z.object({
  message: z.string().min(1).max(1000),
  language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']),
  deviceId: z.string().optional(),
});

/**
 * API Route pour l'évaluation de santé initiale
 * Protégée par rate limiting côté serveur et validation des entrées
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extraire l'IP et les données
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const body = await request.json();

    // 2. Valider les entrées
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { message, language, deviceId } = validationResult.data;

    // 3. Validation et sanitization avancée
    const sanitizationResult = validateAndSanitizeInput({ message, language });
    if (!sanitizationResult.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          message: sanitizationResult.error 
        },
        { status: 400 }
      );
    }

    // 4. Détection de spam
    if (detectSpam(message)) {
      return NextResponse.json(
        { 
          error: 'Spam detected', 
          message: 'Votre message a été identifié comme spam.' 
        },
        { status: 400 }
      );
    }

    // 5. Vérifier le rate limiting
    const identifier = generateRateLimitIdentifier(ip, undefined, deviceId);
    const rateLimit = checkRateLimit(identifier, 7); // 7 requêtes par 24h

    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Vous avez atteint la limite de 7 requêtes par jour. Réessayez demain.',
          resetTime: rateLimit.resetTime,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '7',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    // 6. Appeler l'IA avec les données sanitizées
    const result = await initialHealthAssessment(sanitizationResult.sanitized!);

    // 7. Retourner la réponse avec les headers de rate limiting
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '7',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    });

  } catch (error: any) {
    console.error('Error in health assessment API:', error);
    
    // Ne pas exposer les détails de l'erreur en production
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: isDev ? error.message : 'Une erreur est survenue. Veuillez réessayer.',
      },
      { status: 500 }
    );
  }
}

// Méthode OPTIONS pour CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
