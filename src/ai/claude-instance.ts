import Anthropic from '@anthropic-ai/sdk';

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// Types pour les réponses structurées
export interface ClaudeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Fonction utilitaire pour faire des appels à Claude avec gestion d'erreurs
export async function callClaude<T = any>(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4000
): Promise<ClaudeResponse<T>> {
  try {
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Essayer de parser comme JSON si possible
      try {
        const jsonData = JSON.parse(content.text);
        return { success: true, data: jsonData };
      } catch {
        // Si ce n'est pas du JSON, retourner le texte brut
        return { success: true, data: content.text as T };
      }
    }

    return { success: false, error: 'Response format not supported' };
  } catch (error) {
    console.error('Error calling Claude:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
