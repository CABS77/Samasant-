export function incrementDailyCount() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  const raw = window.localStorage.getItem('ai-request-counts');
  const counts = raw ? JSON.parse(raw) : {};
  counts[todayKey] = (counts[todayKey] || 0) + 1;
  window.localStorage.setItem('ai-request-counts', JSON.stringify(counts));
}

export function hasReachedLimit(limit: number) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const todayKey = new Date().toISOString().slice(0, 10);
  const raw = window.localStorage.getItem('ai-request-counts');
  const counts = raw ? JSON.parse(raw) : {};
  return (counts[todayKey] || 0) >= limit;
}
