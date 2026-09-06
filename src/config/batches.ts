/**
 * Centralized batch configuration.
 *
 * Per CLAUDE.md ("avoid hard-coded current batches/cities/dates") and
 * FEATURE_SUPERCONNECTOR.md Phase 2 ("Batch data is centralized...
 * Future batches must be data-driven"), batch numbers/years are never
 * scattered as literals across components. This module is the single
 * formula-driven source for Phase 1's onboarding batch selector.
 *
 * Anchor points supplied by the owner: BIM35 = 2018-2020, current
 * BIM43 = 2026-2028. That is one new batch intake per year, each
 * spanning BATCH_DURATION_YEARS.
 *
 * Phase 2 owns full batch *management* (an admin-editable `batches`
 * Firestore collection). Until that exists, this formula is the
 * generation source; EARLIEST_BATCH_NUMBER is a placeholder the owner
 * should confirm (see note below) rather than an invented historical
 * fact.
 */

const ANCHOR_BATCH_NUMBER = 35;
const ANCHOR_START_YEAR = 2018;
const BATCH_DURATION_YEARS = 2;
const BATCH_INTERVAL_YEARS = 1;

/**
 * PLACEHOLDER pending owner confirmation: the earliest batch number
 * alumni should be able to select at onboarding. Defaulting to 1 (which
 * this formula would date to 1984) is almost certainly wrong for a real
 * institution history — treat this the same way LEGAL.md asks
 * placeholders to be treated: flagged, not invented as fact. Update
 * once the owner confirms the real earliest BIM batch.
 */
export const EARLIEST_BATCH_NUMBER = 1;

/** How many upcoming (not-yet-started) batches to also offer, so people
 * can register slightly ahead of a new batch's official start. */
const FUTURE_BATCH_LOOKAHEAD = 1;

export interface BatchOption {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
}

function batchStartYear(batchNumber: number): number {
  return (
    ANCHOR_START_YEAR +
    (batchNumber - ANCHOR_BATCH_NUMBER) * BATCH_INTERVAL_YEARS
  );
}

/** Returns every batch option from EARLIEST_BATCH_NUMBER through
 * `currentYear + FUTURE_BATCH_LOOKAHEAD` years out, newest first. */
export function getBatchOptions(
  currentYear: number = new Date().getFullYear(),
): BatchOption[] {
  const maxStartYear = currentYear + FUTURE_BATCH_LOOKAHEAD;
  const options: BatchOption[] = [];

  for (let batchNumber = EARLIEST_BATCH_NUMBER; ; batchNumber++) {
    const startYear = batchStartYear(batchNumber);
    if (startYear > maxStartYear) break;
    options.push({
      id: `BIM${batchNumber}`,
      label: `BIM${batchNumber} (${startYear}\u2013${startYear + BATCH_DURATION_YEARS})`,
      startYear,
      endYear: startYear + BATCH_DURATION_YEARS,
    });
  }

  return options.reverse();
}

export function findBatchOption(
  batchId: string,
  currentYear: number = new Date().getFullYear(),
): BatchOption | undefined {
  return getBatchOptions(currentYear).find((option) => option.id === batchId);
}
