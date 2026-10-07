'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Remedy } from '@/services/remedies';
import { generateRemedies } from '@/ai/flows/generate-remedies-flow';
import { hasConfirmedAdult } from '@/lib/ageConfirmation';
import { Input } from './ui/input';
import { Button } from './ui/button';

type Row = Remedy & { id: string };
const categories = ['all', 'toux', 'fièvre', 'digestion', 'peau', 'douleur', 'stress', 'sommeil', 'paludisme', 'immunité', 'fatigue', 'diarrhée'];
export function RemedyDisplay() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setBusy(true); setError(''); setExpanded(null);
      try {
        const response = await fetch('/api/remedies', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, category, offset: 0 }), signal: controller.signal });
        if (!response.ok) throw new Error();
        const result = await response.json(); setRows(result.remedies); setTotal(result.total);
      } catch { if (!controller.signal.aborted) { setRows([]); setTotal(0); setError(t('error')); } }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 250);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, category, t]);
  const more = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/remedies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, category, offset: rows.length }) });
      if (!response.ok) throw new Error();
      const data = await response.json(); setRows(previous => [...previous, ...data.remedies]);
    } catch { setError(t('error')); } finally { setBusy(false); }
  };
  const generate = async () => {
    if (!hasConfirmedAdult()) { setError(t('age_required')); return; }
    setGenerating(true); setError('');
    try {
      const data = await generateRemedies({ symptom: query, ageConfirmed: true });
      setRows(data.generatedRemedies.map((r, i) => ({ ...r, id: `generated-${i}`, imageUrl: '' }))); setTotal(data.generatedRemedies.length);
    } catch { setError(t('error')); } finally { setGenerating(false); }
  };
  return <div className="min-w-0 space-y-4">
    <label className="block space-y-2 text-sm"><span>{t('catalog_search')}</span><Input value={query} maxLength={100} onChange={event => setQuery(event.target.value)} /></label>
    <div role="group" aria-label={t('catalog_title')} className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-2">
      {categories.map(value => <Button key={value} type="button" variant={category === value ? 'default' : 'outline'} aria-pressed={category === value}
        className="shrink-0" onClick={() => setCategory(value)}>{value === 'all' ? t('catalog_all') : t(`category_${value}`, value)}</Button>)}
    </div>
    {busy && <p role="status">{t('loading')}</p>}
    {error && <p role="alert">{error}</p>}
    {!busy && !rows.length && <p>{t('catalog_empty')}</p>}
    <div className="space-y-2">{rows.map(row => <article key={row.id} className="min-w-0 rounded-xl border p-3">
      <h3 className="break-words text-sm font-semibold">{row.name}</h3>
      {row.isGenerated && <p className="text-xs text-muted-foreground">{t('catalog_generated')}</p>}
      <Button type="button" variant="ghost" aria-expanded={expanded === row.id} aria-controls={`details-${row.id}`} className="h-auto min-h-11 whitespace-normal"
        onClick={() => setExpanded(expanded === row.id ? null : row.id)}>{expanded === row.id ? t('catalog_close') : t('catalog_details')} — {row.name}</Button>
      {expanded === row.id && <div id={`details-${row.id}`} className="space-y-2 pt-2"><p className="break-words text-sm leading-relaxed">{row.description}</p><p className="text-xs text-muted-foreground">{t('catalog_note')}</p></div>}
    </article>)}</div>
    {rows.length < total && <Button type="button" variant="outline" disabled={busy} onClick={() => void more()}>{t('catalog_more')}</Button>}
    {!busy && !rows.length && query.trim().length >= 3 && <Button type="button" variant="outline" disabled={generating} onClick={() => void generate()}>{generating ? t('loading') : t('catalog_generate')}</Button>}
  </div>;
}
