import umrahSteps from '../data/umrah-steps.json';
import hajjSteps from '../data/hajj-steps.json';
import generalDuas from '../data/general-duas.json';
import catalog from '../../backend/audio_catalog.json';
import { generalDuaKey, stepDuaKey } from '../utils/audioKeys';
import { parseManifest } from '../utils/audioManifest';

describe('audio keys', () => {
  it('match the catalog of the admin page (backend/audio_catalog.json)', () => {
    const keys: string[] = [];
    for (const steps of [umrahSteps, hajjSteps] as any[][]) {
      for (const step of [...steps].sort((a, b) => a.order - b.order)) {
        for (const dua of step.duas) keys.push(stepDuaKey(step.id, dua.id));
      }
    }
    for (const category of generalDuas as any[]) {
      category.duas.forEach((_: unknown, i: number) => keys.push(generalDuaKey(category.id, i)));
    }
    expect(keys).toEqual(catalog.map((entry) => entry.key));
  });
});

describe('parseManifest', () => {
  it('keeps valid recordings and rejects foreign URLs', () => {
    const manifest = parseManifest({
      items: {
        'step-talbiyah': { url: '/api/audio/files/step-talbiyah-abc.mp3', version: 'abc', size: 10 },
        'bad key!': { url: '/api/audio/files/x.mp3', version: '1' },
        'dua-x-0': { url: 'https://evil.example/x.mp3', version: '1' },
      },
    });
    expect(Object.keys(manifest)).toEqual(['step-talbiyah']);
    expect(parseManifest(null)).toEqual({});
  });
});
