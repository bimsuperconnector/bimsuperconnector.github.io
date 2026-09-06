import { describe, expect, it } from 'vitest';
import { getBatchOptions, findBatchOption } from './batches';

describe('getBatchOptions', () => {
  it('matches the supplied anchors: BIM35 = 2018-2020, BIM43 = 2026-2028', () => {
    const options = getBatchOptions(2026);
    const bim35 = options.find((o) => o.id === 'BIM35');
    const bim43 = options.find((o) => o.id === 'BIM43');

    expect(bim35).toMatchObject({ startYear: 2018, endYear: 2020 });
    expect(bim43).toMatchObject({ startYear: 2026, endYear: 2028 });
  });

  it('is newest-first and includes one batch beyond the current year (lookahead)', () => {
    const options = getBatchOptions(2026);
    expect(options[0].id).toBe('BIM44');
    expect(options[1].id).toBe('BIM43');
  });

  it('does not include batches starting after the lookahead window', () => {
    const options = getBatchOptions(2026);
    expect(options.some((o) => o.startYear > 2027)).toBe(false);
  });
});

describe('findBatchOption', () => {
  it('finds a known batch by id', () => {
    expect(findBatchOption('BIM35', 2026)).toMatchObject({ startYear: 2018 });
  });

  it('returns undefined for an unknown id', () => {
    expect(findBatchOption('NOT-A-BATCH', 2026)).toBeUndefined();
  });
});
