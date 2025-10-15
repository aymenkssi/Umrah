import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type Language = 'ar' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ar: {
    app_name: 'رفيق العمرة',
    home: 'الرئيسية',
    guide: 'دليل العمرة',
    miqat: 'الميقات',
    prayer_times: 'أوقات الصلاة',
    qibla: 'القبلة',
    settings: 'الإعدادات',
    welcome_title: 'مرحباً بك في رفيق العمرة',
    welcome_subtitle: 'دليلك الشامل لأداء العمرة',
    start_guide: 'ابدأ دليل العمرة',
    find_miqat: 'ابحث عن أقرب ميقات',
    view_prayer_times: 'أوقات الصلاة',
    find_qibla: 'اتجاه القبلة',
    step_completed: 'مكتمل',
    mark_complete: 'تحديد كمكتمل',
    mark_incomplete: 'تحديد كغير مكتمل',
    compact_view: 'عرض مختصر',
    detailed_view: 'عرض مفصل',
    progress: 'التقدم',
    nearest_miqat: 'أقرب ميقات',
    all_miqat: 'جميع المواقيت',
    distance: 'المسافة',
    navigate: 'التوجيه',
    call: 'اتصال',
    search: 'بحث',
    location_permission: 'نستخدم موقعك لاقتراح أقرب ميقات وحساب أوقات الصلاة فقط.',
    grant_permission: 'منح الإذن',
    deny_permission: 'رفض',
    permission_denied: 'تم رفض إذن الموقع',
    permission_denied_desc: 'يمكنك تمكين الموقع من الإعدادات لاستخدام هذه الميزة.',
    language: 'اللغة',
    font_size: 'حجم الخط',
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    about: 'حول',
    privacy: 'الخصوصية',
    privacy_desc: 'هذا التطبيق لا يجمع أي بيانات شخصية. جميع البيانات مخزنة محلياً على جهازك.',
    disclaimer: 'إخلاء المسؤولية',
    disclaimer_desc: 'هذا التطبيق دليل إرشادي فقط. يُرجى استشارة العلماء المحليين في أي أمر تشك فيه.',
    app_version: 'إصدار التطبيق',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    next_prayer: 'الصلاة التالية',
    time_remaining: 'الوقت المتبقي',
    location_required: 'الموقع مطلوب',
    location_required_desc: 'يُرجى تمكين خدمات الموقع لحساب أوقات الصلاة.',
    direction_to_kaaba: 'اتجاه الكعبة المشرفة',
    distance_to_makkah: 'المسافة إلى مكة',
    calibrating: 'جارٍ المعايرة...',
    hold_flat: 'أمسك الهاتف بشكل مسطح',
    qibla_found: 'تم العثور على القبلة',
    km: 'كم',
    audio_dua: 'الاستماع للدعاء',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    notes: 'ملاحظات',
    show_details: 'إظهار التفاصيل',
    hide_details: 'إخفاء التفاصيل',
    reset_progress: 'إعادة تعيين التقدم',
    reset_confirm: 'هل أنت متأكد من إعادة تعيين كل التقدم؟',
    yes: 'نعم',
    no: 'لا',
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    try_again: 'حاول مرة أخرى',
    no_results: 'لا توجد نتائج',
    donate: 'تبرع',
    support_app: 'ادعم هذا التطبيق',
    donate_message: 'ساعدنا في الحفاظ على هذا التطبيق المجاني وتحسينه للحجاج في جميع أنحاء العالم.',
    donate_via_paypal: 'تبرع عبر PayPal',
    thank_you: 'شكراً لك!',
    for_makkah_residents: 'لأهل مكة',
  },
  en: {
    app_name: 'Umrah Companion',
    home: 'Home',
    guide: 'Umrah Guide',
    miqat: 'Miqat',
    prayer_times: 'Prayer Times',
    qibla: 'Qibla',
    settings: 'Settings',
    welcome_title: 'Welcome to Umrah Companion',
    welcome_subtitle: 'Your complete guide to performing Umrah',
    start_guide: 'Start Umrah Guide',
    find_miqat: 'Find Nearest Miqat',
    view_prayer_times: 'Prayer Times',
    find_qibla: 'Qibla Direction',
    step_completed: 'Completed',
    mark_complete: 'Mark as Complete',
    mark_incomplete: 'Mark as Incomplete',
    compact_view: 'Compact View',
    detailed_view: 'Detailed View',
    progress: 'Progress',
    nearest_miqat: 'Nearest Miqat',
    all_miqat: 'All Miqat',
    distance: 'Distance',
    navigate: 'Navigate',
    call: 'Call',
    search: 'Search',
    location_permission: 'We use your location only to suggest the nearest Miqat and calculate prayer times.',
    grant_permission: 'Grant Permission',
    deny_permission: 'Deny',
    permission_denied: 'Location Permission Denied',
    permission_denied_desc: 'You can enable location from settings to use this feature.',
    language: 'Language',
    font_size: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    about: 'About',
    privacy: 'Privacy',
    privacy_desc: 'This app does not collect any personal data. All data is stored locally on your device.',
    disclaimer: 'Disclaimer',
    disclaimer_desc: 'This app is a guidance tool only. Please consult local scholars for any matter you are unsure about.',
    app_version: 'App Version',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    next_prayer: 'Next Prayer',
    time_remaining: 'Time Remaining',
    location_required: 'Location Required',
    location_required_desc: 'Please enable location services to calculate prayer times.',
    direction_to_kaaba: 'Direction to Kaaba',
    distance_to_makkah: 'Distance to Makkah',
    calibrating: 'Calibrating...',
    hold_flat: 'Hold phone flat',
    qibla_found: 'Qibla Found',
    km: 'km',
    audio_dua: 'Listen to Du\'a',
    play: 'Play',
    pause: 'Pause',
    notes: 'Notes',
    show_details: 'Show Details',
    hide_details: 'Hide Details',
    reset_progress: 'Reset Progress',
    reset_confirm: 'Are you sure you want to reset all progress?',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    try_again: 'Try Again',
    no_results: 'No Results',
    donate: 'Donate',
    support_app: 'Support This App',
    donate_message: 'Help us maintain and improve this free app for pilgrims worldwide.',
    donate_via_paypal: 'Donate via PayPal',
    thank_you: 'Thank You!',
    for_makkah_residents: 'For Makkah Residents',
  },
  fr: {
    app_name: 'Compagnon de la \'Omra',
    home: 'Accueil',
    guide: 'Guide de la \'Omra',
    miqat: 'Miqat',
    prayer_times: 'Horaires de Prière',
    qibla: 'Qibla',
    settings: 'Paramètres',
    welcome_title: 'Bienvenue dans Compagnon de la \'Omra',
    welcome_subtitle: 'Votre guide complet pour effectuer la \'Omra',
    start_guide: 'Commencer le Guide',
    find_miqat: 'Trouver le Miqat le Plus Proche',
    view_prayer_times: 'Horaires de Prière',
    find_qibla: 'Direction de la Qibla',
    step_completed: 'Terminé',
    mark_complete: 'Marquer comme Terminé',
    mark_incomplete: 'Marquer comme Non Terminé',
    compact_view: 'Vue Compacte',
    detailed_view: 'Vue Détaillée',
    progress: 'Progrès',
    nearest_miqat: 'Miqat le Plus Proche',
    all_miqat: 'Tous les Miqat',
    distance: 'Distance',
    navigate: 'Naviguer',
    call: 'Appeler',
    search: 'Rechercher',
    location_permission: 'Nous utilisons votre position uniquement pour suggérer le Miqat le plus proche et calculer les horaires de prière.',
    grant_permission: 'Accorder la Permission',
    deny_permission: 'Refuser',
    permission_denied: 'Permission de Localisation Refusée',
    permission_denied_desc: 'Vous pouvez activer la localisation depuis les paramètres pour utiliser cette fonctionnalité.',
    language: 'Langue',
    font_size: 'Taille de Police',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    about: 'À Propos',
    privacy: 'Confidentialité',
    privacy_desc: 'Cette application ne collecte aucune donnée personnelle. Toutes les données sont stockées localement sur votre appareil.',
    disclaimer: 'Avertissement',
    disclaimer_desc: 'Cette application n\'est qu\'un outil d\'orientation. Veuillez consulter les érudits locaux pour toute question dont vous n\'êtes pas sûr.',
    app_version: 'Version de l\'Application',
    fajr: 'Fajr',
    sunrise: 'Lever du Soleil',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    next_prayer: 'Prochaine Prière',
    time_remaining: 'Temps Restant',
    location_required: 'Localisation Requise',
    location_required_desc: 'Veuillez activer les services de localisation pour calculer les horaires de prière.',
    direction_to_kaaba: 'Direction vers la Kaaba',
    distance_to_makkah: 'Distance vers La Mecque',
    calibrating: 'Étalonnage...',
    hold_flat: 'Tenez le téléphone à plat',
    qibla_found: 'Qibla Trouvée',
    km: 'km',
    audio_dua: 'Écouter le Du\'a',
    play: 'Lecture',
    pause: 'Pause',
    notes: 'Notes',
    show_details: 'Afficher les Détails',
    hide_details: 'Masquer les Détails',
    reset_progress: 'Réinitialiser le Progrès',
    reset_confirm: 'Êtes-vous sûr de vouloir réinitialiser tous les progrès?',
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement...',
    error: 'Erreur',
    try_again: 'Réessayer',
    no_results: 'Aucun Résultat',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en' || savedLanguage === 'fr')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
      
      // Note: RTL layout change requires app restart
      // For production, you'd handle this more gracefully
      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        // I18nManager.forceRTL(shouldBeRTL);
        // Would need app restart here
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};