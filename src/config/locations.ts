import type { NormalizedLocation } from '../domain/onboarding/types';

/**
 * Starter alias map for common alternate spellings of the same place
 * (per ARCHITECTURE.md: "Avoid free-text duplicates such as
 * Bangalore/Bengaluru/BLR"). This is deliberately small — a full
 * admin-managed geography reference is out of Phase 1's scope. Extend
 * this map centrally as real duplicates are observed, rather than
 * normalizing ad hoc in components.
 */
const CITY_ALIASES: Readonly<Record<string, string>> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  blr: 'Bengaluru',
  bombay: 'Mumbai',
  mumbai: 'Mumbai',
  madras: 'Chennai',
  chennai: 'Chennai',
  calcutta: 'Kolkata',
  kolkata: 'Kolkata',
  gurgaon: 'Gurugram',
  gurugram: 'Gurugram',
  'new delhi': 'Delhi',
  delhi: 'Delhi',
  ncr: 'Delhi',
};

export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** Normalizes a free-text city name to its canonical display form. */
export function normalizeCity(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const alias = CITY_ALIASES[trimmed.toLowerCase()];
  return alias ?? titleCase(trimmed);
}

/** Lowercase "city|region|country" key used for consistent matching/search. */
export function buildNormalizedKey(
  city: string,
  region: string,
  country: string,
): string {
  return [city, region, country]
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join('|');
}

export function buildNormalizedLocation(
  city: string,
  region: string,
  country: string,
): NormalizedLocation {
  const normalizedCity = normalizeCity(city);
  const normalizedRegion = titleCase(region);
  const normalizedCountry = titleCase(country);
  return {
    city: normalizedCity,
    region: normalizedRegion,
    country: normalizedCountry,
    normalized: buildNormalizedKey(
      normalizedCity,
      normalizedRegion,
      normalizedCountry,
    ),
  };
}
