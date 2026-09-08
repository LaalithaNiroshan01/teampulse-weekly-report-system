/**
 * Client-side ISO 8601 Week Utilities
 * 
 * Provides consistent UTC-based week calculation and navigation
 * across all weekly report selectors and dashboard filters.
 */

const ONE_DAY_MS = 86400000;

/**
 * Returns the ISO 8601 week number and year for a given date in UTC
 */
export function weekInfo(value = new Date()) {
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);

  // ISO week date: Thursday in the current week determines the year
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / ONE_DAY_MS + 1) / 7);

  return { year, weekNumber };
}

/**
 * Shifts an ISO week forward or backward by a delta number of weeks
 */
export function shiftWeek(year, week, delta) {
  // Start from Monday of the given ISO week
  const d = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dayOfWeek + 1 + (week - 1 + delta) * 7);

  return weekInfo(d);
}
