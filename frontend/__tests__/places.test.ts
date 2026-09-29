import { PLACES, directionsUrl, nearestCity } from '../data/places';

describe('holy sites data', () => {
  it('has unique ids, three languages and a location for every place', () => {
    const ids = PLACES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PLACES) {
      for (const lang of ['ar', 'en', 'fr'] as const) {
        expect(p.name[lang]).toBeTruthy();
        expect(p.description[lang]).toBeTruthy();
      }
      expect((p.lat !== undefined && p.lng !== undefined) || !!p.query).toBe(true);
    }
  });

  it('keeps landmarks near their city', () => {
    for (const p of PLACES.filter((x) => x.lat !== undefined)) {
      const [lat, lng] = p.city === 'makkah' ? [21.42, 39.83] : [24.47, 39.61];
      expect(Math.abs(p.lat! - lat)).toBeLessThan(0.2);
      expect(Math.abs(p.lng! - lng)).toBeLessThan(0.2);
    }
  });
});

describe('directionsUrl', () => {
  it('uses coordinates for landmarks and a search for services', () => {
    expect(directionsUrl(PLACES.find((p) => p.id === 'quba')!)).toContain('destination=24.4393,39.6172');
    expect(directionsUrl(PLACES.find((p) => p.id === 'makkah_hospital')!)).toContain('search/?api=1&query=hospital');
  });
});

describe('nearestCity', () => {
  it('picks the closest holy city', () => {
    expect(nearestCity(24.46, 39.6)).toBe('madinah');
    expect(nearestCity(21.4, 39.8)).toBe('makkah');
    expect(nearestCity(48.85, 2.35)).toBe('makkah');
  });
});
