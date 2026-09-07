/**
 * Batch mapping is derived, not hard-coded.
 *
 * Known data points from CLAUDE.md: BIM01 = 1984–1986, BIM35 = 2018–2020,
 * BIM43 = 2026–2028. All three fit a single formula (each batch starts one
 * year after the previous and spans two years):
 *
 *   startYear(N) = 1983 + N
 *   endYear(N)   = startYear(N) + 2
 *
 * The ONLY thing a human ever needs to update as new batches are admitted
 * is `CURRENT_MAX_BATCH_NUMBER` below — everything else (IDs, labels, year
 * ranges, dropdown options) is generated from it. Do not hard-code a list
 * of batch strings anywhere in the UI; always derive from this module.
 */

const BATCH_BASE_YEAR = 1983;

/** The highest batch currently configured. Update this as new batches are admitted. */
export const CURRENT_MAX_BATCH_NUMBER = 43; // BIM43 (2026–2028)

export interface Batch {
  /** e.g. "BIM07" */
  id: string;
  /** e.g. "BIM07 (1990–1992)" */
  label: string;
  batchNumber: number;
  startYear: number;
  endYear: number;
}

export function batchYears(batchNumber: number): { startYear: number; endYear: number } {
  const startYear = BATCH_BASE_YEAR + batchNumber;
  return { startYear, endYear: startYear + 2 };
}

export function batchId(batchNumber: number): string {
  return `BIM${String(batchNumber).padStart(2, '0')}`;
}

export function batchLabel(batchNumber: number): string {
  const { startYear, endYear } = batchYears(batchNumber);
  return `${batchId(batchNumber)} (${startYear}\u2013${endYear})`;
}

export function isValidBatchNumber(batchNumber: number): boolean {
  return Number.isInteger(batchNumber) && batchNumber >= 1 && batchNumber <= CURRENT_MAX_BATCH_NUMBER;
}

export function allBatches(): Batch[] {
  const batches: Batch[] = [];
  for (let n = 1; n <= CURRENT_MAX_BATCH_NUMBER; n++) {
    const { startYear, endYear } = batchYears(n);
    batches.push({ id: batchId(n), label: batchLabel(n), batchNumber: n, startYear, endYear });
  }
  return batches;
}

export function findBatch(batchNumber: number): Batch | undefined {
  if (!isValidBatchNumber(batchNumber)) return undefined;
  const { startYear, endYear } = batchYears(batchNumber);
  return { id: batchId(batchNumber), label: batchLabel(batchNumber), batchNumber, startYear, endYear };
}
