import { describe, expect, it } from 'vitest';
import { computeCoverCrop } from './photo';

describe('computeCoverCrop', () => {
  it('crops a landscape image to a centered square', () => {
    expect(computeCoverCrop(400, 200)).toEqual({ sx: 100, sy: 0, size: 200 });
  });

  it('crops a portrait image to a centered square', () => {
    expect(computeCoverCrop(200, 400)).toEqual({ sx: 0, sy: 100, size: 200 });
  });

  it('leaves an already-square image untouched', () => {
    expect(computeCoverCrop(300, 300)).toEqual({ sx: 0, sy: 0, size: 300 });
  });
});
