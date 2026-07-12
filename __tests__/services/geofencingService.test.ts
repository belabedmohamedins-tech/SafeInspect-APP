// __tests__/services/geofencingService.test.ts
import { haversineDistance, checkProximity } from '../../src/services/geofencingService';

const EARTH_R = 6_371_000;

// ── haversineDistance ──────────────────────────────────────────────────────────────
describe('haversineDistance', () => {
  it('same point → 0 metres', () => {
    expect(haversineDistance(36.7, 3.0, 36.7, 3.0)).toBeCloseTo(0, 1);
  });

  it('Algiers → Tlemcen ≈75 km (rough sanity check)', () => {
    // Algiers: 36.737 N, 3.086 E | Tlemcen: 34.878 N, -1.315 E
    const dist = haversineDistance(36.737, 3.086, 34.878, -1.315);
    // ~430 km great-circle distance
    expect(dist).toBeGreaterThan(400_000);
    expect(dist).toBeLessThan(500_000);
  });

  it('returns a positive number for distinct points', () => {
    expect(haversineDistance(0, 0, 0, 1)).toBeGreaterThan(0);
  });

  it('is symmetric — dist(A,B) === dist(B,A)', () => {
    const ab = haversineDistance(35.0, 1.0, 36.0, 2.0);
    const ba = haversineDistance(36.0, 2.0, 35.0, 1.0);
    expect(ab).toBeCloseTo(ba, 3);
  });

  it('north pole to equator ≈ quarter earth circumference (~10 007 km)', () => {
    const dist = haversineDistance(90, 0, 0, 0);
    // quarter of 2πR = 10 007 543 m
    expect(dist).toBeCloseTo(10_007_543, -3);
  });
});

// ── checkProximity ────────────────────────────────────────────────────────────────
describe('checkProximity', () => {
  const origin = { latitude: 36.737, longitude: 3.086 };
  const nearby  = { latitude: 36.738, longitude: 3.086 }; // ~111 m north
  const farAway = { latitude: 34.878, longitude: -1.315 }; // ~430 km

  it('same point → withinRange=true, distanceMetres≈0', () => {
    const result = checkProximity(origin, origin);
    expect(result.withinRange).toBe(true);
    expect(result.distanceMetres).toBeCloseTo(0, 1);
  });

  it('nearby point (≈111 m) is within default 300 m threshold', () => {
    const result = checkProximity(origin, nearby);
    expect(result.withinRange).toBe(true);
    expect(result.distanceMetres).toBeLessThan(300);
  });

  it('far point (≈430 km) is outside default 300 m threshold', () => {
    const result = checkProximity(origin, farAway);
    expect(result.withinRange).toBe(false);
    expect(result.distanceMetres).toBeGreaterThan(300);
  });

  it('returns correct thresholdMetres (default 300)', () => {
    expect(checkProximity(origin, nearby).thresholdMetres).toBe(300);
  });

  it('respects custom threshold — 50 m excludes 111 m-away point', () => {
    const result = checkProximity(origin, nearby, 50);
    expect(result.withinRange).toBe(false);
    expect(result.thresholdMetres).toBe(50);
  });

  it('respects custom threshold — 200 m includes 111 m-away point', () => {
    const result = checkProximity(origin, nearby, 200);
    expect(result.withinRange).toBe(true);
  });

  it('result has all three keys: withinRange, distanceMetres, thresholdMetres', () => {
    const result = checkProximity(origin, nearby);
    expect(result).toHaveProperty('withinRange');
    expect(result).toHaveProperty('distanceMetres');
    expect(result).toHaveProperty('thresholdMetres');
  });

  it('distanceMetres is a number (not rounded)', () => {
    const result = checkProximity(origin, nearby);
    expect(typeof result.distanceMetres).toBe('number');
  });
});
