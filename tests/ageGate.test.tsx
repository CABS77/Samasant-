import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AGE_CONFIRMATION_KEY } from '../src/lib/ageConfirmation';

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));
vi.mock('@/lib/requestLimit', () => ({
  hasReachedLimit: vi.fn(() => false),
  incrementDailyCount: vi.fn(),
}));

const assessment = { assessment: 'ok', traditionalRemedies: [], nextSteps: 'next' };

describe('confirmation d’âge avant le pré-diagnostic', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => assessment });
    vi.stubGlobal('fetch', fetchMock);
  });

  const submit = async () => {
    const { AIChatSection } = await import('../src/components/ai-chat-section');
    render(<AIChatSection />);
    fireEvent.change(screen.getByPlaceholderText('typeOrSpeakWolof_maangi'), {
      target: { value: 'Mangi am sëkk' },
    });
    fireEvent.click(screen.getByText('answerInFrench_button'));
  };

  it('demande la confirmation et n’appelle pas l’API avant', async () => {
    await submit();
    expect(await screen.findByText('ageGate_title')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('après confirmation, mémorise l’âge et envoie ageConfirmed à l’API', async () => {
    await submit();
    fireEvent.click(await screen.findByText('ageGate_confirm'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.ageConfirmed).toBe(true);
    expect(body.message).toBe('Mangi am sëkk');
    expect(localStorage.getItem(AGE_CONFIRMATION_KEY)).toBe('true');
  });

  it('ne redemande pas si l’âge est déjà confirmé', async () => {
    localStorage.setItem(AGE_CONFIRMATION_KEY, 'true');
    await submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('ageGate_title')).not.toBeInTheDocument();
  });

  it('refuse le service si la personne a moins de 18 ans', async () => {
    const { toast } = await import('@/hooks/use-toast');
    await submit();
    fireEvent.click(await screen.findByText('ageGate_decline'));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'ageGate_declined_title' }))
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem(AGE_CONFIRMATION_KEY)).toBeNull();
  });
});

describe('API /api/health-assessment', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/ai/flows/initial-health-assessment', () => ({
      initialHealthAssessment: vi.fn().mockResolvedValue(assessment),
    }));
  });

  const post = async (body: Record<string, unknown>) => {
    const { POST } = await import('../src/app/api/health-assessment/route');
    const request = new Request('https://www.samasante.tech/api/health-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    });
    return POST(request as any);
  };

  it('refuse une requête sans confirmation d’âge (403)', async () => {
    const res = await post({ message: 'Mangi am sëkk ak yaram wu tàng', language: 'french' });
    expect(res.status).toBe(403);
  });

  it('accepte une requête avec confirmation d’âge', async () => {
    const res = await post({
      message: 'Mangi am sëkk ak yaram wu tàng',
      language: 'french',
      deviceId: 'test-device',
      ageConfirmed: true,
    });
    expect(res.status).toBe(200);
  });
});
