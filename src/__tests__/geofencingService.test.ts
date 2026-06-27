// src/__tests__/geofencingService.test.ts

import { checkProximity } from '../services/geofencingService';

// Coordinates used across tests
const ALGIERS  = { latitude: 36.7538, longitude: 3.0588 };   // Algiers centre
const ORAN     = { latitude: 35.6969, longitude: -0.6331 };  // Oran (~320 km west)
const NEAR     = { latitude: 36.7548, longitude: 3.0608 };   // ~200 m from Algiers
const FAR      = { latitude: 36.760,  longitude: 3.090  };   // ~3 km from Algiers

describe('checkProximity', () => {
  it('returns withinRange=true when distance is under 300 m', () => {
    const result = checkProximity(ALGIERS, NEAR);
    expect(result.withinRange).toBe(true);
    expect(result.distanceMetres).toBeLessThan(300);
  });

  it('returns withinRange=false when distance is over 300 m', () => {
    const result = checkProximity(ALGIERS, FAR);
    expect(result.withinRange).toBe(false);
    expect(result.distanceMetres).toBeGreaterThan(300);
  });

  it('returns distance=0 for identical coordinates', () => {
    const result = checkProximity(ALGIERS, ALGIERS);
    expect(result.distanceMetres).toBe(0);
    expect(result.withinRange).toBe(true);
  });

  it('returns correct large distance between Algiers and Oran (~320 km)', () => {
    const result = checkProximity(ALGIERS, ORAN);
    // Haversine gives ~320 km; assert between 300 000 m and 340 000 m
    expect(result.distanceMetres).toBeGreaterThan(300_000);
    expect(result.distanceMetres).toBeLessThan(340_000);
    expect(result.withinRange).toBe(false);
  });

  it('returns a numeric distanceMetres in all cases', () => {
    const cases = [
      [ALGIERS, NEAR],
      [ALGIERS, FAR],
      [ALGIERS, ORAN],
      [ALGIERS, ALGIERS],
    ] as const;
    for (const [a, b] of cases) {
      const result = checkProximity(a, b);
      expect(typeof result.distanceMetres).toBe('number');
      expect(isNaN(result.distanceMetres)).toBe(false);
    }
  });

  it('is symmetric — checkProximity(A, B) ≈ checkProximity(B, A)', () => {
    const ab = checkProximity(ALGIERS, FAR);
    const ba = checkProximity(FAR, ALGIERS);
    expect(Math.abs(ab.distanceMetres - ba.distanceMetres)).toBeLessThan(1); // <1m error
  });

  it('returns distanceMetres as a positive number for non-identical coords', () => {
    const result = checkProximity(ALGIERS, NEAR);
    expect(result.distanceMetres).toBeGreaterThan(0);
  });

  it('threshold boundary: 299m point is withinRange', () => {
    // ~299 m north of Algiers (roughly 0.00269 degrees latitude)
    const slightlyUnder = { latitude: 36.7538 + 0.00269, longitude: 3.0588 };
    const result = checkProximity(ALGIERS, slightlyUnder);
    expect(result.withinRange).toBe(true);
  });

  it('threshold boundary: 400m point is NOT withinRange', () => {
    // ~400 m north of Algiers (~0.0036 degrees latitude)
    const slightlyOver = { latitude: 36.7538 + 0.0036, longitude: 3.0588 };
    const result = checkProximity(ALGIERS, slightlyOver);
    expect(result.withinRange).toBe(false);
  });
});
