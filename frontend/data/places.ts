import type { Language } from '../contexts/LanguageContext';

type Localized = Record<Language, string>;

export type City = 'makkah' | 'madinah';

export interface Place {
  id: string;
  city: City;
  icon: string;
  name: Localized;
  description: Localized;
  /** Coordinates of well-known landmarks. */
  lat?: number;
  lng?: number;
  /** Google Maps search, used instead of coordinates for services such as hospitals. */
  query?: string;
  kind: 'worship' | 'ritual' | 'history' | 'health';
}

export const PLACES: Place[] = [
  // ------------------------------ Makkah ------------------------------
  {
    id: 'haram',
    city: 'makkah',
    icon: 'cube',
    kind: 'worship',
    name: { ar: 'المسجد الحرام', en: 'Masjid al-Haram', fr: 'Masjid al-Haram' },
    description: {
      ar: 'الكعبة المشرفة، والطواف، والسعي بين الصفا والمروة.',
      en: 'The Kaaba, Tawaf, and Sa‘i between Safa and Marwa.',
      fr: "La Kaaba, le Tawaf et le Sa'i entre Safa et Marwa.",
    },
    lat: 21.4225,
    lng: 39.8262,
  },
  {
    id: 'tanim',
    city: 'makkah',
    icon: 'flag',
    kind: 'ritual',
    name: { ar: 'مسجد عائشة (التنعيم)', en: 'Masjid Aisha (Tan‘im)', fr: "Mosquée Aisha (Tan'im)" },
    description: {
      ar: 'أقرب ميقات لمن هو داخل مكة ويريد الإحرام بالعمرة.',
      en: 'Nearest miqat for people already in Makkah who want to enter ihram for Umrah.',
      fr: "Miqat le plus proche pour les personnes déjà à La Mecque qui veulent entrer en ihram pour la Omra.",
    },
    lat: 21.4504,
    lng: 39.8108,
  },
  {
    id: 'mina',
    city: 'makkah',
    icon: 'bonfire',
    kind: 'ritual',
    name: { ar: 'منى', en: 'Mina', fr: 'Mina' },
    description: {
      ar: 'وادي الخيام ورمي الجمرات في الحج.',
      en: 'The valley of tents and the stoning of the Jamarat during Hajj.',
      fr: 'La vallée des tentes et la lapidation des Jamarat pendant le Hajj.',
    },
    lat: 21.4133,
    lng: 39.8933,
  },
  {
    id: 'muzdalifah',
    city: 'makkah',
    icon: 'moon',
    kind: 'ritual',
    name: { ar: 'مزدلفة', en: 'Muzdalifah', fr: 'Muzdalifa' },
    description: {
      ar: 'المبيت بعد عرفة في الحج.',
      en: 'Where pilgrims spend the night after Arafat during Hajj.',
      fr: "Lieu où les pèlerins passent la nuit après Arafat pendant le Hajj.",
    },
    lat: 21.3833,
    lng: 39.933,
  },
  {
    id: 'arafat',
    city: 'makkah',
    icon: 'sunny',
    kind: 'ritual',
    name: { ar: 'عرفات (جبل الرحمة)', en: 'Arafat (Jabal al-Rahmah)', fr: 'Arafat (Jabal ar-Rahma)' },
    description: {
      ar: 'الوقوف بعرفة ركن الحج الأعظم.',
      en: 'Standing at Arafat is the essential pillar of Hajj.',
      fr: "La station d'Arafat est le pilier essentiel du Hajj.",
    },
    lat: 21.3549,
    lng: 39.9841,
  },
  {
    id: 'hira',
    city: 'makkah',
    icon: 'triangle',
    kind: 'history',
    name: { ar: 'جبل النور (غار حراء)', en: 'Jabal al-Nour (Cave of Hira)', fr: 'Jabal an-Nour (grotte de Hira)' },
    description: {
      ar: 'حيث نزل أول الوحي. الصعود شاق، خذ الماء وتجنب الحر.',
      en: 'Where the first revelation came down. A steep climb: bring water and avoid the heat.',
      fr: "Lieu de la première révélation. Montée difficile : prévoir de l'eau et éviter la chaleur.",
    },
    lat: 21.4575,
    lng: 39.8592,
  },
  {
    id: 'thawr',
    city: 'makkah',
    icon: 'triangle-outline',
    kind: 'history',
    name: { ar: 'جبل ثور', en: 'Jabal Thawr', fr: 'Jabal Thawr' },
    description: {
      ar: 'الغار الذي اختبأ فيه النبي ﷺ وأبو بكر في الهجرة.',
      en: 'The cave where the Prophet ﷺ and Abu Bakr hid during the Hijrah.',
      fr: "La grotte où le Prophète ﷺ et Abou Bakr se sont cachés lors de l'Hégire.",
    },
    lat: 21.3771,
    lng: 39.8497,
  },
  {
    id: 'mualla',
    city: 'makkah',
    icon: 'leaf',
    kind: 'history',
    name: { ar: 'مقبرة المعلاة', en: 'Jannat al-Mu‘alla', fr: "Cimetière d'al-Mu'alla" },
    description: {
      ar: 'مقبرة أهل مكة، وفيها قبر أم المؤمنين خديجة رضي الله عنها.',
      en: 'The historic cemetery of Makkah, where Khadijah, Mother of the Believers, is buried.',
      fr: "Cimetière historique de La Mecque, où repose Khadija, la mère des croyants.",
    },
    lat: 21.4297,
    lng: 39.8292,
  },
  {
    id: 'makkah_hospital',
    city: 'makkah',
    icon: 'medkit',
    kind: 'health',
    name: { ar: 'مستشفيات قريبة', en: 'Nearby hospitals', fr: 'Hôpitaux proches' },
    description: {
      ar: 'يفتح الخريطة على المستشفيات القريبة من موقعك.',
      en: 'Opens the map on hospitals near you.',
      fr: 'Ouvre la carte sur les hôpitaux proches de vous.',
    },
    query: 'hospital near Masjid al-Haram Makkah',
  },

  // ------------------------------ Madinah ------------------------------
  {
    id: 'nabawi',
    city: 'madinah',
    icon: 'moon',
    kind: 'worship',
    name: { ar: 'المسجد النبوي', en: 'Al-Masjid an-Nabawi', fr: 'Mosquée du Prophète' },
    description: {
      ar: 'مسجد النبي ﷺ، والروضة الشريفة (بحجز عبر تطبيق نسك).',
      en: 'The Prophet’s ﷺ Mosque, and the Rawdah (booking through the Nusuk app).',
      fr: 'La mosquée du Prophète ﷺ et la Rawda (réservation via l’application Nusuk).',
    },
    lat: 24.4672,
    lng: 39.6112,
  },
  {
    id: 'quba',
    city: 'madinah',
    icon: 'home',
    kind: 'worship',
    name: { ar: 'مسجد قباء', en: 'Masjid Quba', fr: 'Mosquée de Quba' },
    description: {
      ar: 'أول مسجد في الإسلام. الصلاة فيه كأجر عمرة.',
      en: 'The first mosque in Islam. Praying there carries the reward of an Umrah.',
      fr: "La première mosquée de l'islam. Y prier équivaut en récompense à une Omra.",
    },
    lat: 24.4393,
    lng: 39.6172,
  },
  {
    id: 'baqi',
    city: 'madinah',
    icon: 'leaf',
    kind: 'history',
    name: { ar: 'البقيع', en: 'Jannat al-Baqi‘', fr: "Cimetière d'al-Baqi'" },
    description: {
      ar: 'مقبرة أهل المدينة، وفيها كثير من الصحابة وآل البيت.',
      en: 'The cemetery of Madinah, resting place of many Companions and members of the Prophet’s family.',
      fr: 'Le cimetière de Médine, où reposent de nombreux Compagnons et membres de la famille du Prophète.',
    },
    lat: 24.4673,
    lng: 39.616,
  },
  {
    id: 'uhud',
    city: 'madinah',
    icon: 'triangle',
    kind: 'history',
    name: { ar: 'جبل أحد ومقبرة الشهداء', en: 'Mount Uhud and the martyrs’ cemetery', fr: "Mont Uhud et cimetière des martyrs" },
    description: {
      ar: 'موقع غزوة أحد، وقبر حمزة رضي الله عنه.',
      en: 'Site of the Battle of Uhud, and the grave of Hamzah.',
      fr: "Lieu de la bataille d'Uhud et tombe de Hamza.",
    },
    lat: 24.502,
    lng: 39.6127,
  },
  {
    id: 'qiblatayn',
    city: 'madinah',
    icon: 'swap-horizontal',
    kind: 'history',
    name: { ar: 'مسجد القبلتين', en: 'Masjid al-Qiblatayn', fr: 'Mosquée des deux Qiblas' },
    description: {
      ar: 'حيث نزل تحويل القبلة من بيت المقدس إلى الكعبة.',
      en: 'Where the Qibla was changed from Jerusalem to the Kaaba.',
      fr: 'Lieu où la Qibla a été changée de Jérusalem vers la Kaaba.',
    },
    lat: 24.4843,
    lng: 39.579,
  },
  {
    id: 'dhul_hulayfah',
    city: 'madinah',
    icon: 'flag',
    kind: 'ritual',
    name: { ar: 'ذو الحليفة (أبيار علي)', en: 'Dhu al-Hulayfah (Abyar Ali)', fr: 'Dhou al-Houlaïfa (Abyar Ali)' },
    description: {
      ar: 'ميقات أهل المدينة ومن مرّ بها.',
      en: 'Miqat for people of Madinah and those passing through it.',
      fr: 'Miqat pour les gens de Médine et ceux qui y passent.',
    },
    lat: 24.4137,
    lng: 39.5424,
  },
  {
    id: 'madinah_hospital',
    city: 'madinah',
    icon: 'medkit',
    kind: 'health',
    name: { ar: 'مستشفيات قريبة', en: 'Nearby hospitals', fr: 'Hôpitaux proches' },
    description: {
      ar: 'يفتح الخريطة على المستشفيات القريبة من موقعك.',
      en: 'Opens the map on hospitals near you.',
      fr: 'Ouvre la carte sur les hôpitaux proches de vous.',
    },
    query: 'hospital near Al-Masjid an-Nabawi Madinah',
  },
];

export const EMERGENCY_NUMBERS = [
  { id: 'emergency', number: '911', label: { ar: 'الطوارئ الموحد', en: 'Emergency', fr: 'Urgences' } },
  { id: 'ambulance', number: '997', label: { ar: 'الهلال الأحمر (إسعاف)', en: 'Red Crescent (ambulance)', fr: 'Croissant-Rouge (ambulance)' } },
] as const;

/** Link that opens directions (landmarks) or a search (services) in Google Maps. */
export function directionsUrl(place: Place): string {
  if (place.lat !== undefined && place.lng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query ?? '')}`;
}

/** Madinah when the user is in or near Madinah, otherwise Makkah (also for users abroad). */
export function nearestCity(lat: number, lng: number): City {
  const d = (a: number, b: number) => (lat - a) ** 2 + (lng - b) ** 2;
  const toMadinah = d(24.4672, 39.6112);
  // About 200 km: beyond that, the user is not in Madinah.
  return toMadinah < 4 && toMadinah < d(21.4225, 39.8262) ? 'madinah' : 'makkah';
}
