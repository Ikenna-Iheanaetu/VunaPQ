/**
 * The levels (years) a department offers, derived from its `num_levels`.
 * e.g. Software Engineering has num_levels = 4 -> [100, 200, 300, 400].
 */
export function levelsForCount(numLevels: number): number[] {
  const n = Math.min(Math.max(Math.trunc(numLevels) || 0, 1), 6);
  return Array.from({ length: n }, (_, i) => (i + 1) * 100);
}
