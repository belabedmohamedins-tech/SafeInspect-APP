// __tests__/services/geofencingService.test.ts
import { haversineDistance, checkProximity } from '../../src/services/geofencingService';

describe('haversineDistance', () => {
  it('same coordinates → 0 metres', () => {
    expect(haversineDistance(36.7, 3.0, 36.7, 3.0)).toBeCloseTo(0, 1);
  });

  it('known distance: Algiers to Oran ≈ 350 km', () => {
    const d = haversineDistance(36.737, 3.086, 35.697, -0.634);
    expect(d).toBeGreaterThan(340_000);
    expect(d).toBeLessThan(370_000);
  });

  it('100 m north ≈ 100 metres', () => {
    // ~0.0009 degrees latitude ≈ 100 m
    const d = haversineDistance(36.0, 3.0, 36.0009, 3.0);
    expect(d).toBeGreaterThan(90);
    expect(d).toBeLessThan(110);
  });
});

describe('checkProximity', () => {
  const a = { latitude: 36.737, longitude: 3.086 };

  it('within default 300m → withinRange true', () => {
    // same point
    const r = checkProximity(a, a);
    expect(r.withinRange).toBe(true);
    expect(r.thresholdMetres).toBe(300);
    expect(r.distanceMetres).toBeCloseTo(0, 1);
  });

  it('far point → withinRange false', () => {
    const b = { latitude: 35.697, longitude: -0.634 }; // Oran
    const r = checkProximity(a, b);
    expect(r.withinRange).toBe(false);
  });

  it('custom threshold respected', () => {
    const b = { latitude: 36.7395, longitude: 3.086 }; // ~280m north
    const r500 = checkProximity(a, b, 500);
    const r100 = checkProximity(a, b, 100);
    expect(r500.withinRange).toBe(true);
    expect(r100.withinRange).toBe(false);
  });
});
