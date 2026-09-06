import { describe, expect, it } from 'vitest';
import { buildNormalizedLocation, normalizeCity, titleCase } from './locations';

describe('normalizeCity', () => {
  it('collapses known alternate spellings to a canonical form', () => {
    expect(normalizeCity('Bangalore')).toBe('Bengaluru');
    expect(normalizeCity('BLR')).toBe('Bengaluru');
    expect(normalizeCity('bengaluru')).toBe('Bengaluru');
    expect(normalizeCity('Bombay')).toBe('Mumbai');
  });

  it('title-cases unrecognized cities rather than rejecting them', () => {
    expect(normalizeCity('pune')).toBe('Pune');
    expect(normalizeCity('  new york  ')).toBe('New York');
  });
});

describe('titleCase', () => {
  it('title-cases each word and trims whitespace', () => {
    expect(titleCase('  united states  ')).toBe('United States');
  });
});

describe('buildNormalizedLocation', () => {
  it('normalizes duplicate spellings to the same key', () => {
    const a = buildNormalizedLocation('Bangalore', '', 'India');
    const b = buildNormalizedLocation('Bengaluru', '', 'India');
    expect(a.normalized).toBe(b.normalized);
    expect(a.city).toBe('Bengaluru');
  });

  it('omits empty parts from the normalized key', () => {
    const result = buildNormalizedLocation('Pune', '', 'India');
    expect(result.normalized).toBe('pune|india');
  });
});
