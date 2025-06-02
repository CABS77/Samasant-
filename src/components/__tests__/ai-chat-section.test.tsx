import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIChatSection } from '../ai-chat-section';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des modules
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'fr',
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock('@/ai/flows/initial-health-assessment', () => ({
  initialHealthAssessment: vi.fn().mockResolvedValue({
    assessment: 'Test assessment',
    traditionalRemedies: [
      { name: 'Remedy 1', description: 'Description 1' },
      { name: 'Remedy 2', description: 'Description 2' },
    ],
    nextSteps: 'Test next steps',
  }),
}));

// Wrapper pour les tests avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AIChatSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with all elements', () => {
    render(<AIChatSection />, { wrapper: createWrapper() });
    
    expect(screen.getByText('ai_assistant_sama_ker_xel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('describe_symptoms_placeholder')).toBeInTheDocument();
    expect(screen.getByText('submit_french')).toBeInTheDocument();
    expect(screen.getByText('submit_wolof')).toBeInTheDocument();
  });
  it('should validate empty input', async () => {
    const { toast } = await import('@/hooks/use-toast');
    render(<AIChatSection />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByText('submit_french');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'error_njuumte',
        description: 'enterSymptoms_bindal_sa_malaaka',
      });
    });
  });

  it('should submit assessment with valid input', async () => {
    const { initialHealthAssessment } = await import('@/ai/flows/initial-health-assessment');
    
    render(<AIChatSection />, { wrapper: createWrapper() });
    
    const textarea = screen.getByPlaceholderText('describe_symptoms_placeholder');
    fireEvent.change(textarea, { target: { value: 'Test symptoms' } });
    
    const submitButton = screen.getByText('submit_french');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(initialHealthAssessment).toHaveBeenCalledWith({
        message: 'Test symptoms',
        language: 'french',
      });
    });
  });

  it('should display loading state during submission', async () => {
    render(<AIChatSection />, { wrapper: createWrapper() });
    
    const textarea = screen.getByPlaceholderText('describe_symptoms_placeholder');
    fireEvent.change(textarea, { target: { value: 'Test symptoms' } });
    
    const submitButton = screen.getByText('submit_french');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('analyzing_symptoms')).toBeInTheDocument();
  });
});