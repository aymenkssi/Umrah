import type { Language } from '../contexts/LanguageContext';

export type RitualKind = 'tawaf' | 'sai';

type Localized = Record<Language, string>;

export const TOTAL_ROUNDS = 7;

/** Short reminders shown while counting. Kept to what is widely agreed upon. */
export const RITUAL_GUIDE: Record<
  RitualKind,
  {
    title: Localized;
    start: Localized;
    /** Reminder for a given round (1-based), or the general reminder. */
    round: (round: number) => Localized;
    dua?: { arabic: string; meaning: Localized };
    done: Localized;
  }
> = {
  tawaf: {
    title: { ar: 'الطواف', en: 'Tawaf', fr: 'Tawaf' },
    start: {
      ar: 'ابدأ من الحجر الأسود، واجعل الكعبة عن يسارك، وقل: بسم الله والله أكبر.',
      en: 'Start at the Black Stone with the Kaaba on your left, and say: Bismillah, Allahu Akbar.',
      fr: 'Commencez à la Pierre noire, la Kaaba à votre gauche, et dites : Bismillah, Allahu Akbar.',
    },
    round: (round) =>
      round <= 3
        ? {
            ar: 'يُسنّ للرجال الرَّمَل (الإسراع مع تقارب الخطى) في الأشواط الثلاثة الأولى، والاضطباع طوال الطواف.',
            en: 'For men, it is Sunnah to walk briskly (raml) in the first three rounds, and to keep the right shoulder uncovered (idtiba).',
            fr: "Pour les hommes, il est sunna de presser le pas (raml) lors des trois premiers tours et de garder l'épaule droite découverte (idtiba').",
          }
        : {
            ar: 'امشِ مشياً عادياً، وكبّر كلما حاذيت الحجر الأسود.',
            en: 'Walk normally, and say Allahu Akbar each time you pass the Black Stone.',
            fr: 'Marchez normalement et dites Allahu Akbar à chaque passage devant la Pierre noire.',
          },
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      meaning: {
        ar: 'بين الركن اليماني والحجر الأسود',
        en: 'Between the Yemeni corner and the Black Stone: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire."',
        fr: "Entre le coin yéménite et la Pierre noire : « Seigneur, accorde-nous une belle part ici-bas et une belle part dans l'au-delà, et préserve-nous du châtiment du Feu. »",
      },
    },
    done: {
      ar: 'اكتمل الطواف. صلِّ ركعتين خلف مقام إبراهيم إن تيسّر، واشرب من ماء زمزم.',
      en: 'Tawaf complete. Pray two rak‘ahs behind Maqam Ibrahim if you can, and drink Zamzam water.',
      fr: "Tawaf terminé. Priez deux rak'ahs derrière le Maqam Ibrahim si possible, et buvez de l'eau de Zamzam.",
    },
  },
  sai: {
    title: { ar: 'السعي', en: "Sa'i", fr: "Sa'i" },
    start: {
      ar: 'ابدأ من الصفا، واستقبل الكعبة، وكبّر وادعُ الله.',
      en: 'Start at Safa, face the Kaaba, say Allahu Akbar and make du‘a.',
      fr: "Commencez à Safa, tournez-vous vers la Kaaba, dites Allahu Akbar et faites vos invocations.",
    },
    round: (round) =>
      round % 2 === 1
        ? {
            ar: 'من الصفا إلى المروة. يُسنّ للرجال الإسراع بين العلمين الأخضرين.',
            en: 'From Safa to Marwa. Men hasten between the two green markers.',
            fr: 'De Safa vers Marwa. Les hommes pressent le pas entre les deux repères verts.',
          }
        : {
            ar: 'من المروة إلى الصفا. يُسنّ للرجال الإسراع بين العلمين الأخضرين.',
            en: 'From Marwa to Safa. Men hasten between the two green markers.',
            fr: 'De Marwa vers Safa. Les hommes pressent le pas entre les deux repères verts.',
          },
    dua: {
      arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
      meaning: {
        ar: 'تُقرأ عند الاقتراب من الصفا في بداية السعي (البقرة: ١٥٨)',
        en: 'Recited when approaching Safa at the start (Al-Baqarah 2:158): "Indeed, Safa and Marwa are among the symbols of Allah."',
        fr: "Récité en approchant de Safa au début (Al-Baqara 2:158) : « Safa et Marwa sont vraiment parmi les lieux sacrés d'Allah. »",
      },
    },
    done: {
      ar: 'اكتمل السعي عند المروة. بقي الحلق أو التقصير.',
      en: "Sa'i complete at Marwa. The last step is shaving or shortening the hair.",
      fr: "Sa'i terminé à Marwa. Il reste à se raser ou à se raccourcir les cheveux.",
    },
  },
};

export interface CounterState {
  kind: RitualKind;
  rounds: Record<RitualKind, number>;
}

export const INITIAL_COUNTER: CounterState = { kind: 'tawaf', rounds: { tawaf: 0, sai: 0 } };

export function incrementRound(state: CounterState): CounterState {
  const current = state.rounds[state.kind];
  if (current >= TOTAL_ROUNDS) return state;
  return { ...state, rounds: { ...state.rounds, [state.kind]: current + 1 } };
}

export function decrementRound(state: CounterState): CounterState {
  const current = state.rounds[state.kind];
  if (current <= 0) return state;
  return { ...state, rounds: { ...state.rounds, [state.kind]: current - 1 } };
}

export function parseCounter(raw: string | null): CounterState {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    const clamp = (n: unknown) =>
      typeof n === 'number' && Number.isInteger(n) ? Math.min(TOTAL_ROUNDS, Math.max(0, n)) : 0;
    if (parsed && (parsed.kind === 'tawaf' || parsed.kind === 'sai')) {
      return { kind: parsed.kind, rounds: { tawaf: clamp(parsed.rounds?.tawaf), sai: clamp(parsed.rounds?.sai) } };
    }
  } catch {
    // Corrupted value: start over.
  }
  return INITIAL_COUNTER;
}
