import type { Language } from '../contexts/LanguageContext';

type Localized = Record<Language, string>;

export interface ChecklistItem {
  id: string;
  label: Localized;
}

export interface ChecklistCategory {
  id: string;
  icon: string;
  title: Localized;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'documents',
    icon: 'document-text-outline',
    title: { ar: 'الوثائق', en: 'Documents', fr: 'Documents' },
    items: [
      { id: 'passport', label: { ar: 'جواز السفر (صالح 6 أشهر على الأقل)', en: 'Passport (valid for at least 6 months)', fr: 'Passeport (valide au moins 6 mois)' } },
      { id: 'visa', label: { ar: 'تأشيرة العمرة وتصريح نسك', en: 'Umrah visa and Nusuk permit', fr: 'Visa de la Omra et permis Nusuk' } },
      { id: 'tickets', label: { ar: 'تذاكر الطيران وحجز الفندق', en: 'Flight tickets and hotel booking', fr: "Billets d'avion et réservation d'hôtel" } },
      { id: 'vaccine', label: { ar: 'شهادة التطعيم ضد التهاب السحايا', en: 'Meningitis vaccination certificate', fr: 'Certificat de vaccination contre la méningite' } },
      { id: 'insurance', label: { ar: 'التأمين الصحي للسفر', en: 'Travel health insurance', fr: 'Assurance santé voyage' } },
      { id: 'copies', label: { ar: 'نسخ من الوثائق (ورقية ورقمية)', en: 'Copies of documents (paper and digital)', fr: 'Copies des documents (papier et numérique)' } },
      { id: 'photos', label: { ar: 'صور شخصية', en: 'ID photos', fr: "Photos d'identité" } },
    ],
  },
  {
    id: 'ihram',
    icon: 'shirt-outline',
    title: { ar: 'الإحرام والملابس', en: 'Ihram & clothing', fr: 'Ihram et vêtements' },
    items: [
      { id: 'ihram_cloths', label: { ar: 'إزار ورداء أبيضان (للرجال)، ويفضّل طقمان', en: 'Two white ihram cloths for men (a spare set is useful)', fr: "Deux draps blancs d'ihram pour les hommes (prévoir un 2e jeu)" } },
      { id: 'belt', label: { ar: 'حزام الإحرام مع جيوب', en: 'Ihram belt with pockets', fr: "Ceinture d'ihram avec poches" } },
      { id: 'sandals', label: { ar: 'نعال مريحة لا تغطي الكعب', en: 'Comfortable sandals leaving the heel uncovered', fr: 'Sandales confortables laissant le talon découvert' } },
      { id: 'women_clothes', label: { ar: 'ملابس واسعة ساترة (للنساء)', en: 'Loose, modest clothing for women', fr: 'Vêtements amples et couvrants pour les femmes' } },
      { id: 'unscented', label: { ar: 'صابون ومنتجات بدون عطر', en: 'Unscented soap and toiletries', fr: 'Savon et produits de toilette sans parfum' } },
      { id: 'light_clothes', label: { ar: 'ملابس خفيفة للحر', en: 'Light clothes for the heat', fr: 'Vêtements légers pour la chaleur' } },
    ],
  },
  {
    id: 'health',
    icon: 'medkit-outline',
    title: { ar: 'الصحة', en: 'Health', fr: 'Santé' },
    items: [
      { id: 'medication', label: { ar: 'الأدوية المعتادة مع الوصفة الطبية', en: 'Usual medication with the prescription', fr: 'Médicaments habituels avec leur ordonnance' } },
      { id: 'first_aid', label: { ar: 'حقيبة إسعافات أولية صغيرة', en: 'Small first-aid kit', fr: 'Petite trousse de secours' } },
      { id: 'anti_chafing', label: { ar: 'كريم مضاد للاحتكاك', en: 'Anti-chafing cream', fr: 'Crème anti-frottements' } },
      { id: 'sun', label: { ar: 'مظلة وواقي شمس بدون عطر', en: 'Umbrella and unscented sunscreen', fr: 'Ombrelle et crème solaire sans parfum' } },
      { id: 'water_bottle', label: { ar: 'قارورة ماء', en: 'Water bottle', fr: "Gourde d'eau" } },
      { id: 'masks', label: { ar: 'كمامات', en: 'Face masks', fr: 'Masques' } },
    ],
  },
  {
    id: 'practical',
    icon: 'briefcase-outline',
    title: { ar: 'أغراض عملية', en: 'Practical', fr: 'Pratique' },
    items: [
      { id: 'charger', label: { ar: 'شاحن الهاتف وبطارية متنقلة', en: 'Phone charger and power bank', fr: 'Chargeur et batterie externe' } },
      { id: 'adapter', label: { ar: 'محوّل كهرباء (قابس من نوع G)', en: 'Power adapter (type G plug)', fr: 'Adaptateur de prise (type G)' } },
      { id: 'money', label: { ar: 'ريالات سعودية وبطاقة بنكية', en: 'Saudi riyals and a bank card', fr: 'Riyals saoudiens et carte bancaire' } },
      { id: 'small_bag', label: { ar: 'حقيبة صغيرة للأحذية والأغراض في الحرم', en: 'Small bag for shoes and belongings in the Haram', fr: 'Petit sac pour les chaussures et affaires au Haram' } },
      { id: 'sim', label: { ar: 'شريحة اتصال أو باقة تجوال', en: 'Local SIM card or roaming plan', fr: 'Carte SIM locale ou forfait international' } },
    ],
  },
  {
    id: 'spiritual',
    icon: 'book-outline',
    title: { ar: 'الزاد الروحي', en: 'Spiritual', fr: 'Spirituel' },
    items: [
      { id: 'quran', label: { ar: 'مصحف صغير', en: 'Pocket Quran', fr: 'Coran de poche' } },
      { id: 'duas_list', label: { ar: 'قائمة الأدعية وأسماء من أوصوك بالدعاء', en: 'List of du‘as and people who asked you to pray for them', fr: "Liste d'invocations et des proches qui vous ont demandé de prier pour eux" } },
      { id: 'learn_rites', label: { ar: 'مراجعة مناسك العمرة والحج في التطبيق', en: 'Review the Umrah and Hajj rites in the app', fr: "Revoir les étapes de la Omra et du Hajj dans l'application" } },
      { id: 'forgiveness', label: { ar: 'طلب المسامحة من الأهل وردّ الحقوق', en: 'Ask family for forgiveness and settle debts', fr: 'Demander pardon à ses proches et régler ses dettes' } },
    ],
  },
  {
    id: 'hajj',
    icon: 'sunny-outline',
    title: { ar: 'للحج فقط', en: 'Hajj only', fr: 'Pour le Hajj uniquement' },
    items: [
      { id: 'hajj_permit', label: { ar: 'تأشيرة الحج وتصريح الحج (نسك)', en: 'Hajj visa and Hajj permit (Nusuk)', fr: 'Visa et permis de Hajj (Nusuk)' } },
      { id: 'hajj_group', label: { ar: 'بطاقة الحملة ورقم المخيم في منى وعرفة', en: 'Group card and camp number in Mina and Arafat', fr: 'Carte du groupe et numéro du camp à Mina et à Arafat' } },
      { id: 'hady_voucher', label: { ar: 'صك الهدي (للمتمتع والقارن)', en: 'Hady voucher (Tamattu\' and Qiran)', fr: "Bon de sacrifice (Tamattou' et Qiran)" } },
      { id: 'pebble_bag', label: { ar: 'كيس صغير لحصى الجمار', en: 'Small bag for the pebbles', fr: 'Petit sac pour les cailloux' } },
      { id: 'sleeping_mat', label: { ar: 'حصير خفيف للمبيت بمزدلفة', en: 'Light mat for the night at Muzdalifah', fr: 'Tapis léger pour la nuit à Mouzdalifa' } },
      { id: 'spray_fan', label: { ar: 'بخاخ ماء ومروحة صغيرة', en: 'Water spray and small fan', fr: "Brumisateur et petit ventilateur" } },
      { id: 'extra_ihram', label: { ar: 'طقم إحرام إضافي لأيام الحج', en: 'Extra ihram set for the days of Hajj', fr: "Jeu d'ihram supplémentaire pour les jours du Hajj" } },
    ],
  },
];

export interface CustomItem {
  id: string;
  text: string;
}

export interface ChecklistState {
  checked: string[];
  custom: CustomItem[];
}

export const EMPTY_CHECKLIST: ChecklistState = { checked: [], custom: [] };

export const ALL_ITEM_IDS = CHECKLIST.flatMap((c) => c.items.map((i) => i.id));

export function parseChecklist(raw: string | null): ChecklistState {
  try {
    const p = raw ? JSON.parse(raw) : null;
    const custom: CustomItem[] = Array.isArray(p?.custom)
      ? p.custom
          .filter((c: unknown): c is CustomItem => {
            const item = c as CustomItem;
            return typeof item?.id === 'string' && typeof item?.text === 'string';
          })
          .slice(0, 100)
      : [];
    const known = new Set([...ALL_ITEM_IDS, ...custom.map((c) => c.id)]);
    const checked: string[] = Array.isArray(p?.checked)
      ? p.checked.filter((id: unknown): id is string => typeof id === 'string' && known.has(id))
      : [];
    return { checked, custom };
  } catch {
    return EMPTY_CHECKLIST;
  }
}

export function toggleChecked(state: ChecklistState, id: string): ChecklistState {
  const checked = state.checked.includes(id) ? state.checked.filter((x) => x !== id) : [...state.checked, id];
  return { ...state, checked };
}

export function addCustomItem(state: ChecklistState, text: string, id: string): ChecklistState {
  const trimmed = text.trim().slice(0, 120);
  if (!trimmed) return state;
  return { ...state, custom: [...state.custom, { id, text: trimmed }] };
}

export function removeCustomItem(state: ChecklistState, id: string): ChecklistState {
  return { custom: state.custom.filter((c) => c.id !== id), checked: state.checked.filter((x) => x !== id) };
}
