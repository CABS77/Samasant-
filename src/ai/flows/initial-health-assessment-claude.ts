// initial-health-assessment-claude.ts
'use server';
/**
 * @fileOverview Version Claude du flow d'évaluation de santé initiale
 */

import { callClaude } from '@/ai/claude-instance';
import { z } from 'zod';

const InitialHealthAssessmentInputSchema = z.object({
  message: z.string().describe('The user message describing their symptoms or health concerns.'),
  language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']).describe('The language of the user message. Franco-Wolof is a mix of French and Wolof.'),
});
export type InitialHealthAssessmentInput = z.infer<typeof InitialHealthAssessmentInputSchema>;

const RemedyDetailSchema = z.object({
  name: z.string().describe("Nom du remède/astuce."),
  description: z.string().describe("Description et utilisation du remède/astuce.")
});

const InitialHealthAssessmentOutputSchema = z.object({
  assessment: z.string().describe('An initial assessment of the user provided symptoms.'),
  traditionalRemedies: z.array(RemedyDetailSchema).describe('A list of at least 5 traditional remedies or grandmother\'s tips (conseils de grand-mère / astuces de mag ñi) relevant to the user\'s symptoms, each with a name and description.'),
  nextSteps: z.string().describe('General next steps advice, including whether to see a doctor (rendez-vous ak doktoor) or go to a clinic (dem ci daara-jàngu).'),
});
export type InitialHealthAssessmentOutput = z.infer<typeof InitialHealthAssessmentOutputSchema>;

const SYSTEM_PROMPT = `Vous êtes "Sama Kër Xel" (Ma Maison de Sagesse), un assistant IA amical de SamaSanté. Votre rôle est de partager la sagesse traditionnelle sénégalaise et des conseils de grand-mère ('conseils de grand-mère' / 'astuces de mag ñi') pour les préoccupations de santé courantes.

**AVERTISSEMENT MÉDICAL IMPÉRATIF ET NON NÉGOCIABLE :**
VOUS N'ÊTES PAS UN PROFESSIONNEL DE LA SANTÉ. VOS CONSEILS NE REMPLACENT EN AUCUN CAS UN DIAGNOSTIC, UN AVIS OU UN TRAITEMENT MÉDICAL PROFESSIONNEL.

Pour TOUS les sujets de santé, vous devez :
1. Présenter les informations UNIQUEMENT comme des connaissances traditionnelles, des remèdes populaires ou des 'astuces de mag ñi'.
2. Déclarer FORTEMENT et CLAIREMENT dans CHAQUE réponse que ces informations ne constituent PAS un substitut à un avis médical professionnel.
3. TOUJOURS conseiller à l'utilisateur de consulter un médecin qualifié ('doktoor') ou un professionnel de la santé.
4. Souligner que les remèdes traditionnels peuvent COMPLÉTER les soins médicaux professionnels, mais ne doivent JAMAIS les remplacer.

Répondez UNIQUEMENT avec un objet JSON valide contenant :
- "assessment": Une brève évaluation initiale
- "traditionalRemedies": Un tableau d'AU MOINS 5 remèdes traditionnels sénégalais avec "name" et "description"
- "nextSteps": Suggestions d'étapes incluant OBLIGATOIREMENT la recommandation de consulter un médecin`;

export async function initialHealthAssessmentClaude(input: InitialHealthAssessmentInput): Promise<InitialHealthAssessmentOutput> {
  const { message, language } = input;
  
  const userPrompt = `Message utilisateur : "${message}"
Langue de réponse : ${language}

Basé sur ce message, fournissez une évaluation de santé initiale en ${language === 'french' ? 'français' : language === 'wolof' ? 'wolof' : language === 'pulaar' ? 'pulaar' : 'franco-wolof'}.

Répondez avec un objet JSON contenant assessment, traditionalRemedies (array avec name et description), et nextSteps.`;

  const response = await callClaude<InitialHealthAssessmentOutput>(
    userPrompt,
    SYSTEM_PROMPT,
    4000
  );

  if (!response.success || !response.data) {
    throw new Error(`Failed to get Claude response: ${response.error || 'Unknown error'}`);
  }

  // Validation des données
  const result = response.data;
  if (!result.assessment || !result.traditionalRemedies || !result.nextSteps) {
    throw new Error('Invalid response format from Claude');
  }

  // S'assurer que traditionalRemedies est bien un array
  if (!Array.isArray(result.traditionalRemedies)) {
    throw new Error('traditionalRemedies must be an array');
  }

  return result;
}
