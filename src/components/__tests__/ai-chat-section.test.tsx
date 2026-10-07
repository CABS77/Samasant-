import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';
const mocks = vi.hoisted(() => ({ toast: vi.fn(), limit: vi.fn(), increment: vi.fn(), fetch: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ toast: mocks.toast }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }) }));
vi.mock('@/lib/requestLimit', () => ({ hasReachedLimit: mocks.limit, incrementDailyCount: mocks.increment }));
import { AIChatSection } from '../ai-chat-section';
const output = { assessment: 'Test assessment', traditionalRemedies: [{ name: 'Remedy 1', description: 'Description 1' }], nextSteps: 'Test next steps' };
beforeEach(() => {
  vi.clearAllMocks(); mocks.limit.mockReturnValue(false);
  mocks.fetch.mockResolvedValue(Response.json(output)); vi.stubGlobal('fetch', mocks.fetch);
  localStorage.setItem('samasante.ageConfirmed.v1', 'true');
});
afterEach(() => vi.unstubAllGlobals());
const submit = (language = 'French') => {
  fireEvent.change(screen.getByLabelText('symptom_input_label'), { target: { value: 'Test symptoms' } });
  fireEvent.click(screen.getByText(`answerIn${language}_button`));
};
describe('AI conversation transport and language', () => {
  it('labels the message, both response languages and voice controls', () => {
    render(<AIChatSection />);
    expect(screen.getByLabelText('symptom_input_label')).toBeInTheDocument();
    expect(screen.getByText('answerInFrench_button')).toBeInTheDocument();
    expect(screen.getByText('answerInWolof_button')).toBeInTheDocument();
    expect(screen.getByLabelText('voice_language')).toBeInTheDocument();
  });
  it('rejects empty input before any request', () => {
    render(<AIChatSection />); fireEvent.click(screen.getByText('answerInFrench_button'));
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'enterSymptoms_bindal_sa_malaaka' }));
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('sends age confirmation to the protected API and renders the returned answer', async () => {
    render(<AIChatSection />); submit(); await screen.findByText('Test assessment');
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = mocks.fetch.mock.calls[0];
    expect(url).toBe('/api/health-assessment');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ message: 'Test symptoms', language: 'french', ageConfirmed: true });
    expect(mocks.increment).toHaveBeenCalledTimes(1);
  });
  it('shows a loading state while the API is pending', async () => {
    mocks.fetch.mockImplementation(() => new Promise(() => {}));
    const view = render(<AIChatSection />); submit();
    expect(screen.getAllByText('loading_yeggeul').length).toBeGreaterThan(0); view.unmount();
  });
  it('does not call the API when the local daily allowance is exhausted', () => {
    mocks.limit.mockReturnValue(true); render(<AIChatSection />); submit();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'dailyLimitReached_title' }));
    expect(mocks.fetch).not.toHaveBeenCalled(); expect(mocks.increment).not.toHaveBeenCalled();
  });
  it('keeps separate language results and reuses the current conversation response', async () => {
    render(<AIChatSection />); submit(); await screen.findByText('Test assessment');
    submit('Wolof'); await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('loading_yeggeul')).not.toBeInTheDocument());
    expect(JSON.parse(mocks.fetch.mock.calls[1][1].body).language).toBe('wolof');
    submit('French'); expect(mocks.fetch).toHaveBeenCalledTimes(2);
  });
});
