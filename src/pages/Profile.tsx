import { useState, useEffect } from 'react';
import { User, Edit, Save, X, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call
      const updatedUser = {
        ...user!,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        department: user.department || ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Kullanıcı bilgileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Profil Bilgileri</h1>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>İptal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {(user?.firstName?.charAt(0)?.toUpperCase()) || (user?.email?.charAt(0)?.toUpperCase()) || 'U'}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}
                </h2>
                <p className="text-gray-600 capitalize">{user?.role || 'Kullanıcı'}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.firstName || ''}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.lastName || ''}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.email || ''}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Telefon numarası"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.phone || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Departman"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.department || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg capitalize">
                    {user?.role || ''}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kullanıcı Adı
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.username || ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Son Giriş
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : 'Hiç giriş yapılmamış'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hesap Oluşturma
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {user?.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;