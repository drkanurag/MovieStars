/**
 * Set Intersection Algorithm
 * 
 * Optimized multi-filter intersection (genre ∩ platform ∩ language ∩ year).
 * Always intersects starting with the smallest set first to minimize work.
 */

export class SetIntersectionEngine {
  public static intersectMany(sets: Set<string>[]): Set<string> {
    const validSets = sets.filter((s) => s.size > 0);
    if (validSets.length === 0) return new Set();

    // Sort sets in ascending order of size: smallest set first
    validSets.sort((a, b) => a.size - b.size);

    let result = new Set(validSets[0]);

    for (let i = 1; i < validSets.length; i++) {
      const current = validSets[i];
      const nextResult = new Set<string>();

      for (const id of result) {
        if (current.has(id)) {
          nextResult.add(id);
        }
      }

      result = nextResult;
      // Short-circuit if intersection becomes empty
      if (result.size === 0) break;
    }

    return result;
  }
}

