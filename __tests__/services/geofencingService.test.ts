// __tests__/services/geofencingService.test.ts
import { haversineDistance, checkProximity } from '../../src/services/geofencingService';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(36.7, 3.05, 36.7, 3.05)).toBe(0);
  });

  it('returns a positive distance for different coordinates', () => {
    const d = haversineDistance(36.7, 3.05, 36.71, 3.06);
    expect(d).toBeGreaterThan(0);
  });

  it('is approximately correct for a known distance', () => {
    // Algiers to Oran is ~360 km
    const d = haversineDistance(36.737, 3.086, 35.697, -0.633);
    expect(d).toBeGreaterThan(350_000);
    expect(d).toBeLessThan(380_000);
  });

  it('is symmetric', () => {
    const d1 = haversineDistance(36.7, 3.05, 36.75, 3.1);
    const d2 = haversineDistance(36.75, 3.1, 36.7, 3.05);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});

describe('checkProximity', () => {
  const a = { latitude: 36.7, longitude: 3.05 };
  const nearby = { latitude: 36.701, longitude: 3.051 }; // ~150m away
  const far = { latitude: 36.8, longitude: 3.2 };        // ~16km away

  it('returns withinRange=true for nearby points', () => {
    const result = checkProximity(a, nearby);
    expect(result.withinRange).toBe(true);
    expect(result.thresholdMetres).toBe(300);
    expect(result.distanceMetres).toBeGreaterThan(0);
  });

  it('returns withinRange=false for far points', () => {
    const result = checkProximity(a, far);
    expect(result.withinRange).toBe(false);
  });

  it('returns withinRange=true for identical points', () => {
    const result = checkProximity(a, a);
    expect(result.withinRange).toBe(true);
    expect(result.distanceMetres).toBe(0);
  });

  it('respects custom threshold', () => {
    // nearby is ~150m — within 200m but beyond 100m
    expect(checkProximity(a, nearby, 200).withinRange).toBe(true);
    expect(checkProximity(a, nearby, 100).withinRange).toBe(false);
  });

  it('returns distanceMetres in the result', () => {
    const result = checkProximity(a, far);
    expect(result.distanceMetres).toBeGreaterThan(1000);
  });
});
