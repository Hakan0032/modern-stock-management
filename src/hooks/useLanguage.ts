import { useState, useEffect } from 'react';

type Language = 'tr' | 'en';

interface Translations {
  [key: string]: {
    tr: string;
    en: string;
  };
}

const translations: Translations = {
  // Common
  'save': { tr: 'Kaydet', en: 'Save' },
  'cancel': { tr: 'İptal', en: 'Cancel' },
  'delete': { tr: 'Sil', en: 'Delete' },
  'edit': { tr: 'Düzenle', en: 'Edit' },
  'add': { tr: 'Ekle', en: 'Add' },
  'search': { tr: 'Ara', en: 'Search' },
  'loading': { tr: 'Yükleniyor...', en: 'Loading...' },
  
  // Settings
  'settings': { tr: 'Ayarlar', en: 'Settings' },
  'notifications': { tr: 'Bildirimler', en: 'Notifications' },
  'appearance': { tr: 'Görünüm', en: 'Appearance' },
  'security': { tr: 'Güvenlik', en: 'Security' },
  'account': { tr: 'Hesap', en: 'Account' },
  'theme': { tr: 'Tema', en: 'Theme' },
  'language': { tr: 'Dil', en: 'Language' },
  'light': { tr: 'Açık', en: 'Light' },
  'dark': { tr: 'Koyu', en: 'Dark' },
  'system': { tr: 'Sistem', en: 'System' },
  
  // Navigation
  'dashboard': { tr: 'Kontrol Paneli', en: 'Dashboard' },
  'materials': { tr: 'Malzemeler', en: 'Materials' },
  'machines': { tr: 'Makineler', en: 'Machines' },
  'workorders': { tr: 'İş Emirleri', en: 'Work Orders' },
  'movements': { tr: 'Hareketler', en: 'Movements' },
  'admin': { tr: 'Yönetim', en: 'Admin' },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    changeLanguage,
    t
  };
};