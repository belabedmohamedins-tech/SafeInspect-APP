// __tests__/services/geofencingService.test.ts
import { haversineDistance, checkProximity } from '../../src/services/geofencingService';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(36.7, 3.05, 36.7, 3.05)).toBeCloseTo(0, 3);
  });

  it('returns ~111 km between 0° and 1° latitude on same meridian', () => {
    const d = haversineDistance(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it('calculates ~200 m for close coordinates', () => {
    // ~0.0018 degrees latitude ≈ 200 m
    const d = haversineDistance(36.7, 3.05, 36.7018, 3.05);
    expect(d).toBeGreaterThan(150);
    expect(d).toBeLessThan(250);
  });
});

describe('checkProximity', () => {
  const a = { latitude: 36.7, longitude: 3.05 };

  it('returns withinRange=true when coords are identical', () => {
    const r = checkProximity(a, a);
    expect(r.withinRange).toBe(true);
    expect(r.distanceMetres).toBeCloseTo(0, 3);
    expect(r.thresholdMetres).toBe(300);
  });

  it('returns withinRange=true when distance < 300 m (default threshold)', () => {
    const b = { latitude: 36.7018, longitude: 3.05 }; // ~200 m away
    const r = checkProximity(a, b);
    expect(r.withinRange).toBe(true);
  });

  it('returns withinRange=false when distance > 300 m (default threshold)', () => {
    const b = { latitude: 36.704, longitude: 3.05 }; // ~445 m away
    const r = checkProximity(a, b);
    expect(r.withinRange).toBe(false);
  });

  it('respects a custom thresholdMetres', () => {
    const b = { latitude: 36.7018, longitude: 3.05 }; // ~200 m
    const rTight  = checkProximity(a, b, 100);
    const rGenerous = checkProximity(a, b, 500);
    expect(rTight.withinRange).toBe(false);
    expect(rGenerous.withinRange).toBe(true);
  });

  it('echoes the correct thresholdMetres in the result', () => {
    const r = checkProximity(a, a, 50);
    expect(r.thresholdMetres).toBe(50);
  });
});
