import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as service from '../src/services/remedies';

const sampleRemedies = [
  { name: 'r1', description: '', symptom: 'cough', imageUrl: '' },
];

describe('getRemedies caching', () => {
  beforeEach(() => {
    service.clearRemedyCache();
    vi.restoreAllMocks();
  });

  it('fetches from source on first call', async () => {
    const spy = vi.spyOn(service, 'fetchRemediesFromSource').mockResolvedValue(sampleRemedies);
    const result = await service.getRemedies('cough', 'en');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(sampleRemedies);
  });

  it('returns cached data on second call', async () => {
    const spy = vi.spyOn(service, 'fetchRemediesFromSource').mockResolvedValue(sampleRemedies);
    const first = await service.getRemedies('fever', 'en');
    const second = await service.getRemedies('fever', 'en');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});
