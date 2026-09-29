import {
  calculateDistance,
  calculateQiblaDirection,
  formatTimeRemaining,
  normalizeAngle,
  qiblaGuidance,
  smoothHeading,
} from '../utils/calculations';

describe('calculateDistance', () => {
  it('returns 0 for identical points', () => {
    expect(calculateDistance(21.42, 39.82, 21.42, 39.82)).toBe(0);
  });

  it('computes the Madinah – Makkah great-circle distance', () => {
    // Masjid an-Nabawi -> Kaaba is roughly 340 km as the crow flies.
    const distance = calculateDistance(24.4672, 39.6111, 21.4225, 39.8262);
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(345);
  });
});

describe('calculateQiblaDirection', () => {
  it('points south-east from Paris', () => {
    const { bearing, distance } = calculateQiblaDirection(48.8566, 2.3522);
    expect(bearing).toBeGreaterThan(117);
    expect(bearing).toBeLessThan(121);
    expect(distance).toBeGreaterThan(4400);
    expect(distance).toBeLessThan(4600);
  });

  it('points west from Kuala Lumpur', () => {
    const { bearing } = calculateQiblaDirection(3.139, 101.6869);
    expect(bearing).toBeGreaterThan(290);
    expect(bearing).toBeLessThan(296);
  });
});

describe('normalizeAngle', () => {
  it.each([
    [0, 0],
    [180, 180],
    [190, -170],
    [-190, 170],
    [360, 0],
    [725, 5],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeAngle(input)).toBeCloseTo(expected);
  });
});

describe('formatTimeRemaining', () => {
  it('formats minutes only', () => {
    expect(formatTimeRemaining(12 * 60 * 1000)).toBe('12m');
  });

  it('formats hours with zero-padded minutes', () => {
    expect(formatTimeRemaining((2 * 60 + 5) * 60 * 1000)).toBe('2h 05m');
  });

  it('rounds partial minutes up and never goes negative', () => {
    expect(formatTimeRemaining(30 * 1000)).toBe('1m');
    expect(formatTimeRemaining(-5000)).toBe('0m');
  });
});

describe('smoothHeading', () => {
  it('starts from the first reading', () => {
    expect(smoothHeading(null, 370)).toBeCloseTo(10);
  });

  it('moves part of the way towards the new reading', () => {
    expect(smoothHeading(100, 120, 0.5)).toBeCloseTo(110);
  });

  it('takes the short way across north', () => {
    expect(smoothHeading(350, 10, 0.5)).toBeCloseTo(0);
    expect(smoothHeading(10, 350, 0.5)).toBeCloseTo(0);
  });
});

describe('qiblaGuidance', () => {
  it('is aligned within the tolerance', () => {
    expect(qiblaGuidance(120, 117)).toEqual({ aligned: true, direction: null, degrees: 3 });
  });

  it('tells to turn right or left the short way', () => {
    expect(qiblaGuidance(120, 90)).toEqual({ aligned: false, direction: 'right', degrees: 30 });
    expect(qiblaGuidance(10, 340)).toEqual({ aligned: false, direction: 'right', degrees: 30 });
    expect(qiblaGuidance(300, 10)).toEqual({ aligned: false, direction: 'left', degrees: 70 });
  });
});
