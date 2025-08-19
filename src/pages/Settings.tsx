import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Save, Loader2, RotateCcw, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { useDatabaseStatus } from '../utils/databaseStatus';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    stockAlerts: boolean;
    workOrderUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'tr' | 'en';
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const themeHook = useTheme();
  const { theme: currentTheme = 'light', toggleTheme, isDark = false, setTheme } = themeHook || {};
  const languageHook = useLanguage();
  const { language: currentLanguage = 'tr', changeLanguage, t } = languageHook || {};
  const { status: dbStatus, isChecking: isCheckingDb, checkStatus: checkDbStatus } = useDatabaseStatus();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      stockAlerts: true,
      workOrderUpdates: true
    },
    appearance: {
      theme: 'light',
      language: 'tr'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    }
  });

  const [originalSettings, setOriginalSettings] = useState<SettingsData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // localStorage'dan ayarları yükleme
  const loadFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setOriginalSettings(parsed);
        applyTheme(parsed.appearance.theme);
        return parsed;
      }
    } catch (error) {
      console.error('localStorage ayarları yüklenirken hata:', error);
    }
    return null;
  };

  // localStorage'a ayarları kaydetme
  const saveToLocalStorage = (settingsToSave: typeof settings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
      // Bildirim ayarlarını ayrı olarak da kaydet
      localStorage.setItem('notificationSettings', JSON.stringify(settingsToSave.notifications));
    } catch (error) {
      console.error('localStorage ayarları kaydedilirken hata:', error);
    }
  };

  // Load settings from API and localStorage on component mount
  useEffect(() => {
    loadSettings();
    // Sync current theme and language with settings
    if (currentTheme && currentLanguage) {
      setSettings(prev => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          theme: currentTheme,
          language: currentLanguage
        }
      }));
    }
  }, [currentTheme, currentLanguage]);

  // Değişiklikleri kontrol etme
  useEffect(() => {
    if (originalSettings) {
      const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(hasChanged);
    }
  }, [settings, originalSettings]);

  // Apply theme changes immediately
  useEffect(() => {
    applyTheme(settings.appearance.theme);
    // Save to localStorage for persistence
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings.appearance.theme]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from localStorage first
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setOriginalSettings(parsed);
      }

      // Then load from API
      const response = await api.get('/settings');
      if (response.data.success) {
        setSettings(response.data.data);
        setOriginalSettings(response.data.data);
        localStorage.setItem('userSettings', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.remove('light', 'dark');
      root.classList.add(prefersDark ? 'dark' : 'light');
      localStorage.setItem('theme', 'system');
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
    
    // Force a re-render to apply theme changes immediately
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 10);
  };

  const validateSettings = (settingsToValidate: SettingsData): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    // Validate theme
    if (!['light', 'dark', 'system'].includes(settingsToValidate.appearance.theme)) {
      newErrors.theme = 'Geçersiz tema seçimi';
    }

    // Validate language
    if (!['tr', 'en'].includes(settingsToValidate.appearance.language)) {
      newErrors.language = 'Geçersiz dil seçimi';
    }

    // Validate session timeout
    if (![15, 30, 60, 120, 480].includes(settingsToValidate.security.sessionTimeout)) {
      newErrors.sessionTimeout = 'Geçersiz oturum zaman aşımı';
    }

    return newErrors;
  };

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    
    setSettings(newSettings);
    
    // Clear any existing errors for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Apply theme immediately if theme is changed
    if (section === 'appearance' && key === 'theme') {
      // Use the setTheme function from useTheme hook for proper integration
      if (setTheme && ['light', 'dark', 'system'].includes(value)) {
        setTheme(value as 'light' | 'dark' | 'system');
      }
      
      // Show immediate feedback
      toast.success(`Tema ${value === 'light' ? 'açık' : value === 'dark' ? 'koyu' : 'sistem'} olarak değiştirildi`);
    }
    
    // Dil değişikliklerini uygula
    if (section === 'appearance' && key === 'language') {
      if (changeLanguage && ['tr', 'en'].includes(value)) {
        changeLanguage(value as 'tr' | 'en');
      }
      // Show immediate feedback
      const languageText = t ? t('language') : 'Dil';
      toast.success(`${languageText} ${value === 'tr' ? 'Türkçe' : 'English'} olarak değiştirildi`);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      // Validate settings
      const validationErrors = validateSettings(settings);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Lütfen hataları düzeltin');
        return;
      }

      // Önce localStorage'a kaydet
      saveToLocalStorage(settings);
      
      // Sonra API'ye kaydet
      const response = await api.put('/settings', settings);
      
      if (response.data.success) {
        setOriginalSettings(settings);
        setHasChanges(false);
        setErrors({});
        
        toast.success('Ayarlar başarıyla kaydedildi!');
      } else {
        throw new Error(response.data.message || 'Ayarlar API\'ye kaydedilemedi');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      // API hatası olsa bile localStorage'a kaydedildi
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.warning('Ayarlar yerel olarak kaydedildi. Sunucu bağlantısı kontrol edilecek.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      
      const response = await api.delete('/settings');
      
      if (response.data.success) {
        // Reload settings from API
        await loadSettings();
        toast.success('Ayarlar varsayılan değerlere sıfırlandı');
      }
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      toast.error('Ayarlar sıfırlanırken bir hata oluştu!');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Ayarlar yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings')}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>Sıfırla</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSaving ? 'Kaydediliyor...' : hasChanges ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Notifications Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('notifications')}</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Bildirimleri</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Önemli güncellemeler için e-posta bildirimleri al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Bildirimleri</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tarayıcı bildirimleri al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stok Uyarıları</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kritik stok seviyesi uyarıları</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.stockAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'stockAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">İş Emri Güncellemeleri</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">İş emri durumu değişiklik bildirimleri</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.workOrderUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'workOrderUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('appearance')}</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('theme')}</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  className={`w-full max-w-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.theme ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="light">{t('light')}</option>
                  <option value="dark">{t('dark')}</option>
                  <option value="system">{t('system')}</option>
                </select>
                {errors.theme && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.theme}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('language')}</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  className={`w-full max-w-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.language ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.language}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('security')}</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">İki Faktörlü Kimlik Doğrulama</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hesabınız için ek güvenlik katmanı</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Oturum Zaman Aşımı (dakika)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className={`w-full max-w-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.sessionTimeout ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value={15}>15 dakika</option>
                  <option value={30}>30 dakika</option>
                  <option value={60}>1 saat</option>
                  <option value={120}>2 saat</option>
                  <option value={480}>8 saat</option>
                </select>
                {errors.sessionTimeout && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sessionTimeout}</p>
                )}
              </div>
            </div>
          </div>

          {/* Database Status Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Veritabanı Durumu</h2>
            </div>
            <div className="ml-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {dbStatus.isConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        dbStatus.isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                      }`}>
                        {dbStatus.isConnected ? 'Bağlı' : 'Bağlı Değil'}
                      </span>
                      {dbStatus.responseTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({dbStatus.responseTime}ms)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{dbStatus.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Son kontrol: {dbStatus.lastChecked.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={checkDbStatus}
                  disabled={isCheckingDb}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingDb ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isCheckingDb ? 'Kontrol Ediliyor...' : 'Yenile'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Hesap Bilgileri</h2>
            </div>
            <div className="ml-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Kullanıcı:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Rol:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{user?.role || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">E-posta:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{user?.email || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Son Giriş:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : 'Hiç giriş yapılmamış'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;