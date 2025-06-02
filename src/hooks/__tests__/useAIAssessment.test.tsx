import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAIAssessment } from '../ai/useAIAssessment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock du module AI
vi.mock('@/ai/flows/initial-health-assessment', () => ({
  initialHealthAssessment: vi.fn(),
}));

// Créer un wrapper avec QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        cacheTime: 0,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useAIAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null data when no input is provided', () => {
    const { result } = renderHook(
      () => useAIAssessment(null),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch assessment with valid input', async () => {
    const mockResponse = {
      assessment: 'Test assessment',
      traditionalRemedies: [],
      nextSteps: 'Next steps',
    };

    const { initialHealthAssessment } = await import('@/ai/flows/initial-health-assessment');
    vi.mocked(initialHealthAssessment).mockResolvedValueOnce(mockResponse);

    const input = {
      message: 'Test symptoms',
      language: 'french' as const,
    };

    const { result } = renderHook(
      () => useAIAssessment(input),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(initialHealthAssessment).toHaveBeenCalledWith(input);
  });

  it('should handle errors gracefully', async () => {
    const { initialHealthAssessment } = await import('@/ai/flows/initial-health-assessment');
    vi.mocked(initialHealthAssessment).mockRejectedValueOnce(new Error('API Error'));

    const input = {
      message: 'Test symptoms',
      language: 'french' as const,
    };

    const { result } = renderHook(
      () => useAIAssessment(input),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('API Error'));
  });
});