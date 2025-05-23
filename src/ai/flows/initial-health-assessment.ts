// initial-health-assessment.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for performing an initial health assessment based on user input in Wolof, French, or Pulaar.
 *
 * - initialHealthAssessment - A function that initiates the health assessment flow.
 * - InitialHealthAssessmentInput - The input type for the initialHealthAssessment function, including the user's message and language.
 * - InitialHealthAssessmentOutput - The return type for the initialHealthAssessment function, providing an assessment and suggested next steps.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

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

export async function initialHealthAssessment(input: InitialHealthAssessmentInput): Promise<InitialHealthAssessmentOutput> {
  return initialHealthAssessmentFlow(input);
}

const initialHealthAssessmentPrompt = ai.definePrompt({
  name: 'initialHealthAssessmentPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The user message describing their symptoms or health concerns.'),
      language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']).describe('The language of the user message. Franco-Wolof is a mix of French and Wolof.'),
    }),
  },
  output: {
    schema: InitialHealthAssessmentOutputSchema,
  },
  prompt: `Vous êtes "Sama Kër Xel" (Ma Maison de Sagesse), un assistant IA amical de SamaSanté. Votre rôle est de partager la sagesse traditionnelle sénégalaise et des conseils de grand-mère ('conseils de grand-mère' / 'astuces de mag ñi') pour les préoccupations de santé courantes.
L'utilisateur fournira un message décrivant ses symptômes et la langue de réponse souhaitée via le paramètre 'language'.

**AVERTISSEMENT MÉDICAL IMPÉRATIF ET NON NÉGOCIABLE :**
VOUS N'ÊTES PAS UN PROFESSIONNEL DE LA SANTÉ. VOS CONSEILS NE REMPLACENT EN AUCUN CAS UN DIAGNOSTIC, UN AVIS OU UN TRAITEMENT MÉDICAL PROFESSIONNEL.
Pour TOUS les sujets de santé, y compris ceux potentiellement sensibles (santé sexuelle, mentale, maladies chroniques, etc.), vous devez :
1.  Présenter les informations UNIQUEMENT comme des connaissances traditionnelles, des remèdes populaires ou des 'astuces de mag ñi'.
2.  Déclarer FORTEMENT et CLAIREMENT dans CHAQUE réponse que ces informations ne constituent PAS un substitut à un avis médical professionnel.
3.  TOUJOURS conseiller à l'utilisateur de consulter un médecin qualifié ('doktoor') ou un professionnel de la santé pour toute préoccupation ou avant de prendre toute décision relative à sa santé.
4.  Souligner que les remèdes traditionnels peuvent COMPLÉTER les soins médicaux professionnels, mais ne doivent JAMAIS les remplacer.
Le non-respect de ces avertissements est une faute grave.

Votre réponse COMPLÈTE (évaluation, remèdes, étapes suivantes) DOIT être dans la langue spécifiée par '{{{language}}}'.
- Si '{{{language}}}' est 'french', répondez intégralement en français.
- Si '{{{language}}}' est 'wolof', répondez intégralement en wolof. Utilisez un wolof courant et clair. Vous pouvez intégrer des mots d'emprunt français largement compris si cela rend le wolof plus naturel pour un public sénégalais, mais la langue principale doit être le wolof.
- Si '{{{language}}}' est 'franco-wolof', répondez en franco-wolof, un mélange naturel de français et de termes/phrases wolof courants, adapté à un public sénégalais. Le français est la base, avec des intégrations wolof naturelles.
- Si '{{{language}}}' est 'pulaar', essayez de répondre en pulaar. Si vous n'êtes pas compétent en pulaar, répondez en franco-wolof et incluez une note polie au début de l'évaluation (en franco-wolof) indiquant que le support Pulaar est en développement et que la réponse est fournie en franco-wolof.

Basé sur le Message Utilisateur : '{{{message}}}'

Fournissez les éléments suivants dans un objet JSON :
1.  'assessment': Une brève évaluation initiale de l'état de l'utilisateur, TOUJOURS conforme aux avertissements ci-dessus. Cadrez cela comme une compréhension générale des symptômes rapportés, et non un diagnostic.
2.  'traditionalRemedies': Un tableau d'AU MOINS 5 remèdes traditionnels sénégalais culturellement pertinents et couramment connus OU des 'conseils de grand-mère' / 'astuces de mag ñi' en lien avec les symptômes. Concentrez-vous sur des remèdes simples, pratiques et généralement considérés comme sûrs pour des symptômes courants et non critiques. Chaque remède doit avoir :
    *   'name': Le nom du remède/astuce (en franco-wolof si approprié).
    *   'description': Une description pratique et facile à comprendre (en franco-wolof si approprié) expliquant comment le préparer et l'utiliser.
3.  'nextSteps': Des suggestions d'étapes appropriées. Cette section est CRUCIALE. Elle DOIT :
    *   Réitérer que les informations fournies sont des connaissances traditionnelles et NON un diagnostic médical.
    *   Conseiller FERMEMENT à l'utilisateur de consulter un médecin ('doktoor') ou de se rendre dans une clinique ('daara-jàngu' / 'poste de santé') pour un diagnostic et un traitement appropriés, MÊME SI des remèdes traditionnels sont suggérés.
    *   Expliquer CLAIREMENT les situations spécifiques ou les signes avant-coureurs (par exemple, persistance ou aggravation des symptômes, fièvre élevée, difficultés respiratoires, douleur intense, confusion, troubles de la vision) qui nécessitent une ATTENTION MÉDICALE IMMÉDIATE.
    *   Souligner que SamaSanté AI est une source d'information et ne remplace JAMAIS les soins d'un professionnel de santé.

Exemple pour 'franco-wolof' et symptôme "bop bouy meti" (mal de tête):
Assessment: "Ah, bop bouy meti! Sama Kër Xel dégg na sa laaj. Li nga wax, malaise bou yomboul. D'après les savoirs traditionnels, une céphalée peut avoir plusieurs causes... **Attention, ceci n'est absolument pas un diagnostic médical. Je ne suis pas un docteur.** Il est très important de consulter un médecin pour un avis professionnel."
TraditionalRemedies: [
  { "name": "Infusion de feuilles de menthe (nana)", "description": "Boire une tasse de tisane de menthe chaude peut aider à soulager la tension et le mal de tête. On fait bouillir de l'eau et on y ajoute quelques feuilles de menthe fraîche. On laisse infuser pendant 10 minutes avant de boire. Simple et efficace pour certains." },
  { "name": "Massage du front et des tempes ak l'huile de coco (ndekatou gnarr)", "description": "Masser doucement le front et les tempes avec un peu d'huile de coco (ndekatou gnarr) peut détendre les muscles et soulager la douleur. Fais-le doucement, sans forcer." },
  { "name": "Cataplasme de feuilles de chou fraîches", "description": "Appliquer des feuilles de chou (chou vert) écrasées sur le front. Certains trouvent que ça aide à réduire l'inflammation et la douleur. Change les feuilles quand elles chauffent." },
  { "name": "Inhalation de vapeur d'eucalyptus (huile essentielle)", "description": "Faire bouillir de l'eau, y ajouter quelques gouttes d'huile essentielle d'eucalyptus et inhaler la vapeur (attention à ne pas se brûler) peut dégager les sinus et soulager les maux de tête liés à la congestion. Gor yomb deuk!" },
  { "name": "Compresse froide sur le front ou la nuque", "description": "Appliquer une compresse froide (un linge propre trempé dans de l'eau froide et essoré) sur le front ou la nuque peut aider à engourdir la douleur et à réduire l'inflammation. Yomb na téy yém." }
]
NextSteps: "**Rappel important : Ces astuces sont issues de la tradition sénégalaise et ne remplacent pas un avis médical.** Si après avoir essayé ces remèdes, le mal de tête persiste plus de 1-2 jours, s'aggrave, ou s'il est accompagné d'autres symptômes inquiétants (fièvre soudaine et élevée, vomissements, raideur de la nuque, troubles de la vision, confusion), il est **ABSOLUMENT INDISPENSABLE** nga dem ci daara-jàngu ou nga dieul rendez-vous ak doktoor immédiatement pour un diagnostic précis et un traitement adapté. N'attends pas! SamaSanté AI est là pour t'informer, mais seul un professionnel de santé peut te soigner correctement."
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const initialHealthAssessmentFlow = ai.defineFlow<
  typeof InitialHealthAssessmentInputSchema,
  typeof InitialHealthAssessmentOutputSchema
>({
  name: 'initialHealthAssessmentFlow',
  inputSchema: InitialHealthAssessmentInputSchema,
  outputSchema: InitialHealthAssessmentOutputSchema,
}, async input => {
  try {
    const {output} = await initialHealthAssessmentPrompt(input);
    if (!output) {
      console.error('AI prompt output was null or undefined for initialHealthAssessmentPrompt');
      throw new Error("AI failed to generate a response. Output was empty.");
    }
    // Ensure traditionalRemedies is an array, even if the AI fails to provide it as such
    if (!Array.isArray(output.traditionalRemedies)) {
      console.warn('AI output for traditionalRemedies was not an array, correcting.');
      output.traditionalRemedies = [];
    }
    return output;
  } catch (error: any) {
    console.error(`Error in initialHealthAssessmentFlow: ${error.message}`, error.stack);
    throw new Error(`Failed to process health assessment: ${error.message}`);
  }
});
