import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

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

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call to save settings
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Ayarlar</h1>
            </div>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Notifications Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Bildirimler</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-posta Bildirimleri</label>
                  <p className="text-xs text-gray-500">Önemli güncellemeler için e-posta bildirimleri al</p>
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
                  <label className="text-sm font-medium text-gray-700">Push Bildirimleri</label>
                  <p className="text-xs text-gray-500">Tarayıcı bildirimleri al</p>
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
                  <label className="text-sm font-medium text-gray-700">Stok Uyarıları</label>
                  <p className="text-xs text-gray-500">Kritik stok seviyesi uyarıları</p>
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
                  <label className="text-sm font-medium text-gray-700">İş Emri Güncellemeleri</label>
                  <p className="text-xs text-gray-500">İş emri durumu değişiklik bildirimleri</p>
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
              <Palette className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Görünüm</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Açık Tema</option>
                  <option value="dark">Koyu Tema</option>
                  <option value="system">Sistem Ayarı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Güvenlik</h2>
            </div>
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">İki Faktörlü Kimlik Doğrulama</label>
                  <p className="text-xs text-gray-500">Hesabınız için ek güvenlik katmanı</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Oturum Zaman Aşımı (dakika)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 dakika</option>
                  <option value={30}>30 dakika</option>
                  <option value={60}>1 saat</option>
                  <option value={120}>2 saat</option>
                  <option value={480}>8 saat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Hesap Bilgileri</h2>
            </div>
            <div className="ml-8 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Kullanıcı:</span>
                  <span className="ml-2 text-gray-600">{(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rol:</span>
                  <span className="ml-2 text-gray-600 capitalize">{user?.role || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">E-posta:</span>
                  <span className="ml-2 text-gray-600">{user?.email || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Son Giriş:</span>
                  <span className="ml-2 text-gray-600">
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