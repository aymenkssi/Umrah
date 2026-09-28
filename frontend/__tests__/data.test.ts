import { translations } from '../contexts/LanguageContext';
import umrahSteps from '../data/umrah-steps.json';
import miqatData from '../data/miqat.json';
import generalDuas from '../data/general-duas.json';

const LANGUAGES = ['ar', 'en', 'fr'] as const;

const expectLocalized = (value: unknown, where: string) => {
  for (const lang of LANGUAGES) {
    const text = (value as Record<string, unknown>)?.[lang];
    if (typeof text !== 'string' || text.trim() === '') {
      throw new Error(`Missing "${lang}" text in ${where}`);
    }
  }
};

describe('translations', () => {
  it('defines the same keys in every language', () => {
    const reference = Object.keys(translations.en).sort();
    for (const lang of LANGUAGES) {
      expect(Object.keys(translations[lang]).sort()).toEqual(reference);
    }
  });
});

describe('umrah-steps.json', () => {
  it('has unique ids and consecutive order', () => {
    const ids = umrahSteps.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = umrahSteps.map((step) => step.order).sort((a, b) => a - b);
    expect(orders).toEqual(orders.map((_, i) => i + 1));
  });

  it('is translated in all languages', () => {
    for (const step of umrahSteps as any[]) {
      for (const field of ['title', 'summary', 'details', 'dua', 'notes']) {
        if (step[field]) expectLocalized(step[field], `${step.id}.${field}`);
      }
      (step.additionalDuas ?? []).forEach((dua: unknown, i: number) =>
        expectLocalized(dua, `${step.id}.additionalDuas[${i}]`)
      );
    }
  });
});

describe('miqat.json', () => {
  it('has valid coordinates around Makkah and translated names', () => {
    for (const miqat of miqatData as any[]) {
      expectLocalized(miqat.name, `${miqat.id}.name`);
      expectLocalized(miqat.notes, `${miqat.id}.notes`);
      expect(miqat.lat).toBeGreaterThan(15);
      expect(miqat.lat).toBeLessThan(30);
      expect(miqat.lng).toBeGreaterThan(35);
      expect(miqat.lng).toBeLessThan(45);
    }
  });

  it('has exactly one miqat for Makkah residents', () => {
    expect((miqatData as any[]).filter((m) => m.isForMakkah)).toHaveLength(1);
  });
});

describe('general-duas.json', () => {
  it('has Arabic text and a translation for every du\'a', () => {
    for (const category of generalDuas as any[]) {
      expectLocalized(category.category, `${category.id}.category`);
      for (const dua of category.duas) {
        expect(typeof dua.arabic).toBe('string');
        expect(dua.translation?.en).toBeTruthy();
        expect(dua.translation?.fr).toBeTruthy();
      }
    }
  });
});
