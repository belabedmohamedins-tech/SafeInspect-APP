// __tests__/services/geofencingService.test.ts
import { haversineDistance, checkProximity } from '../../src/services/geofencingService';

describe('haversineDistance', () => {
  it('returns ~0 for identical coords', () => {
    expect(haversineDistance(36.7, 3.0, 36.7, 3.0)).toBeCloseTo(0, 0);
  });

  it('returns positive distance for different coords', () => {
    const d = haversineDistance(36.7, 3.0, 36.72, 3.02);
    expect(d).toBeGreaterThan(0);
  });

  it('returns known approx distance (Algiers → Oran ~360km)', () => {
    const d = haversineDistance(36.7372, 3.0865, 35.6969, -0.6331);
    expect(d).toBeGreaterThan(350_000);
    expect(d).toBeLessThan(400_000);
  });

  it('is symmetric', () => {
    const d1 = haversineDistance(36.7, 3.0, 36.72, 3.02);
    const d2 = haversineDistance(36.72, 3.02, 36.7, 3.0);
    expect(d1).toBeCloseTo(d2, 3);
  });
});

describe('checkProximity', () => {
  const A = { latitude: 36.7, longitude: 3.0 };
  const B_NEAR = { latitude: 36.701, longitude: 3.001 };   // ~130m
  const B_FAR  = { latitude: 36.8,  longitude: 3.2 };     // ~20km+

  it('returns withinRange=true for nearby points', () => {
    const r = checkProximity(A, B_NEAR);
    expect(r.withinRange).toBe(true);
    expect(r.thresholdMetres).toBe(300);
  });

  it('returns withinRange=false for distant points', () => {
    const r = checkProximity(A, B_FAR);
    expect(r.withinRange).toBe(false);
  });

  it('respects custom threshold', () => {
    const r = checkProximity(A, B_NEAR, 50); // 50m threshold
    expect(r.withinRange).toBe(false);
    expect(r.thresholdMetres).toBe(50);
  });

  it('exposes distanceMetres', () => {
    const r = checkProximity(A, B_NEAR);
    expect(r.distanceMetres).toBeGreaterThan(0);
  });

  it('identical points are within range', () => {
    const r = checkProximity(A, A);
    expect(r.withinRange).toBe(true);
  });
});
