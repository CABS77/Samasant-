import { useQuery, useQueryClient } from '@tanstack/react-query';
import { initialHealthAssessment } from '@/ai/flows/initial-health-assessment';
import type { InitialHealthAssessmentInput, InitialHealthAssessmentOutput } from '@/ai/flows/initial-health-assessment';
import { useEffect } from 'react';

interface UseAIAssessmentOptions {
  enabled?: boolean;
  onSuccess?: (data: InitialHealthAssessmentOutput) => void;
  onError?: (error: Error) => void;
}

export function useAIAssessment(
  input: InitialHealthAssessmentInput | null,
  options?: UseAIAssessmentOptions
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ai-assessment', input?.message, input?.language],
    queryFn: async () => {
      if (!input) throw new Error('No input provided');
      
      // Check if we have a cached response for this exact input
      const cachedData = queryClient.getQueryData<InitialHealthAssessmentOutput>([
        'ai-assessment',
        input.message,
        input.language,
      ]);
      
      if (cachedData) {
        return cachedData;
      }

      return initialHealthAssessment(input);
    },
    enabled: !!input && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 60, // 1 heure - les données restent fraîches
    gcTime: 1000 * 60 * 60 * 24, // 24 heures - garde en cache
    retry: 2, // Réessayer 2 fois en cas d'échec
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Gérer les callbacks onSuccess et onError avec useEffect
  useEffect(() => {
    if (query.isSuccess && query.data && options?.onSuccess) {
      options.onSuccess(query.data);
    }
  }, [query.isSuccess, query.data, options?.onSuccess]);

  useEffect(() => {
    if (query.isError && query.error && options?.onError) {
      options.onError(query.error);
    }
  }, [query.isError, query.error, options?.onError]);

  return query;
}

// Hook pour précharger des évaluations communes
export function usePrefetchCommonAssessments() {
  const queryClient = useQueryClient();

  const prefetchAssessment = async (input: InitialHealthAssessmentInput) => {
    await queryClient.prefetchQuery({
      queryKey: ['ai-assessment', input.message, input.language],
      queryFn: () => initialHealthAssessment(input),
      staleTime: 1000 * 60 * 60,
    });
  };

  return { prefetchAssessment };
}
