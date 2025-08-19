import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Settings,
  Database,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { formatDate } from '../utils';
import { toast } from 'sonner';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMaterials: 0,
    totalWorkOrders: 0,
    systemUptime: '99.9%',
    lastBackup: new Date().toISOString()
  });

  useEffect(() => {
    fetchUsers();
    fetchSystemStats();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock user data since we don't have a users endpoint
      const mockUsers: User[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          username: 'admin_user',
          email: 'admin@mermer.com',
          password: 'hashed_password',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          department: 'IT',
          phone: '+90 555 123 4567',
          isActive: true,
          lastLogin: '2024-01-15T10:00:00Z',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440012',
          username: 'depo_sorumlusu',
          email: 'depo@mermer.com',
          password: 'hashed_password',
          firstName: 'Depo',
          lastName: 'Sorumlusu',
          role: 'operator',
          department: 'Depo',
          phone: '+90 555 123 4568',
          isActive: true,
          lastLogin: '2024-01-15T10:00:00Z',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440013',
          username: 'planlama_uzman',
          email: 'planlama@mermer.com',
          password: 'hashed_password',
          firstName: 'Planlama',
          lastName: 'Uzmanı',
          role: 'planner',
          department: 'Planlama',
          phone: '+90 555 123 4570',
          isActive: true,
          lastLogin: '2024-02-01T10:00:00Z',
          createdAt: new Date('2024-02-01').toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440014',
          username: 'teknisyen_user',
          email: 'teknisyen@mermer.com',
          password: 'hashed_password',
          firstName: 'Teknisyen',
          lastName: 'User',
          role: 'operator',
          department: 'Teknik',
          phone: '+90 555 123 4571',
          isActive: false,
          lastLogin: '2024-02-15T09:00:00Z',
          createdAt: new Date('2024-02-15').toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      let filteredUsers = mockUsers;
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (roleFilter) {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
      }

      setUsers(filteredUsers);
    } catch (error) {
      toast.error('Hata', {
        description: 'Kullanıcılar yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [statsRes] = await Promise.all([
        api.get('/dashboard/stats')
      ]);

      setSystemStats(prev => ({
        ...prev,
        totalUsers: 4,
        activeUsers: 3,
        totalMaterials: statsRes.data?.data?.totalMaterials || 0,
        totalWorkOrders: statsRes.data?.data?.activeWorkOrders || 0
      }));
    } catch (error) {
      // Handle error silently for demo
    }
  };

  const handleUserToggle = async (id: string, isActive: boolean) => {
    try {
      // Mock API call
      setUsers(prev => prev.map(user =>
        user.id === id ? { ...user, isActive: !isActive } : user
      ));
      toast.success('Başarılı', {
        description: `Kullanıcı ${!isActive ? 'aktif' : 'pasif'} edildi`
      });
    } catch (error) {
      toast.error('Hata', {
        description: 'Kullanıcı durumu güncellenirken hata oluştu'
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    console.log('Admin - Delete user button clicked for ID:', id);
    console.log('Admin - Current users count:', users.length);
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setUsers(prev => prev.filter(user => user.id !== id));
      console.log('Admin - User deleted, new count:', users.filter(user => user.id !== id).length);
      toast.success('Başarılı', {
        description: 'Kullanıcı başarıyla silindi'
      });
    } catch (error) {
      toast.error('Hata', {
        description: 'Kullanıcı silinirken hata oluştu'
      });
    }
  };

  const handleEditUser = async (id: string) => {
    console.log('Admin - Edit user button clicked for ID:', id);
    try {
      const user = users.find(u => u.id === id);
      console.log('Admin - User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('Admin - Editing user:', user.firstName, user.lastName);
        toast.info('Bilgi', {
          description: `${user.firstName} ${user.lastName} kullanıcısı düzenleniyor...`
        });
        // Here you would typically open an edit modal or navigate to edit page
        // For now, just show a toast message
      }
    } catch (error) {
      toast.error('Hata', {
        description: 'Kullanıcı düzenlenirken hata oluştu'
      });
    }
  };

  // Database operations handlers
  const handleManualBackup = async () => {
    try {
      toast.loading('Yedekleme başlatılıyor...', { id: 'backup' });
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSystemStats(prev => ({
        ...prev,
        lastBackup: new Date().toISOString()
      }));
      
      toast.success('Başarılı', {
        id: 'backup',
        description: 'Manuel yedekleme başarıyla tamamlandı'
      });
    } catch (error) {
      toast.error('Hata', {
        id: 'backup',
        description: 'Yedekleme işlemi sırasında hata oluştu'
      });
    }
  };

  const handleDatabaseOptimization = async () => {
    try {
      toast.loading('Veritabanı optimizasyonu başlatılıyor...', { id: 'optimize' });
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast.success('Başarılı', {
        id: 'optimize',
        description: 'Veritabanı optimizasyonu başarıyla tamamlandı'
      });
    } catch (error) {
      toast.error('Hata', {
        id: 'optimize',
        description: 'Optimizasyon işlemi sırasında hata oluştu'
      });
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Sistem loglarını temizlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      toast.loading('Sistem logları temizleniyor...', { id: 'clear-logs' });
      
      // Simulate log clearing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Başarılı', {
        id: 'clear-logs',
        description: 'Sistem logları başarıyla temizlendi'
      });
    } catch (error) {
      toast.error('Hata', {
        id: 'clear-logs',
        description: 'Log temizleme işlemi sırasında hata oluştu'
      });
    }
  };

  const handleRestoreFromBackup = async () => {
    if (!confirm('Yedekten geri yükleme işlemi mevcut verileri etkileyebilir. Devam etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      toast.loading('Yedekten geri yükleme başlatılıyor...', { id: 'restore' });
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      toast.success('Başarılı', {
        id: 'restore',
        description: 'Yedekten geri yükleme başarıyla tamamlandı'
      });
    } catch (error) {
      toast.error('Hata', {
        id: 'restore',
        description: 'Geri yükleme işlemi sırasında hata oluştu'
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Depo':
        return 'bg-blue-100 text-blue-800';
      case 'Planlama':
        return 'bg-green-100 text-green-800';
      case 'Teknisyen':
        return 'bg-orange-100 text-orange-800';
      case 'Satınalma':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yönetim Paneli</h1>
          <p className="text-gray-600">Sistem yönetimi ve kullanıcı kontrolü</p>
        </div>
        <button
          onClick={() => setShowNewUserModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-green-600">{systemStats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sistem Uptime</p>
              <p className="text-2xl font-bold text-green-600">{systemStats.systemUptime}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Son Yedekleme</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(systemStats.lastBackup)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-800">Sistem Uyarıları</h3>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          <ul className="list-disc list-inside space-y-1">
            <li>1 kullanıcı hesabı pasif durumda</li>
            <li>Sistem yedeklemesi 24 saat içinde yapılmalı</li>
            <li>5 malzeme kritik stok seviyesinde</li>
          </ul>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h2>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Roller</option>
                <option value="Admin">Admin</option>
                <option value="Depo">Depo</option>
                <option value="Planlama">Planlama</option>
                <option value="Teknisyen">Teknisyen</option>
                <option value="Satınalma">Satınalma</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Kullanıcı bulunamadı</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {(user?.firstName?.charAt(0)?.toUpperCase()) || (user?.email?.charAt(0)?.toUpperCase()) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user?.role || ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user?.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUserToggle(user.id, user.isActive)}
                          className={`p-1 rounded cursor-pointer transition-colors ${user.isActive
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                          title={user.isActive ? 'Pasif Et' : 'Aktif Et'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Sistem Ayarları
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Otomatik Yedekleme</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Aktif
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Bildirimleri</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Aktif
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Audit Log</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Aktif
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance Mode</span>
              <button className="bg-gray-400 text-white px-3 py-1 rounded text-sm">
                Pasif
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Veritabanı İşlemleri
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={handleManualBackup}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manuel Yedekleme Başlat
            </button>
            <button 
              onClick={handleDatabaseOptimization}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Veritabanı Optimizasyonu
            </button>
            <button 
              onClick={handleClearLogs}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Sistem Loglarını Temizle
            </button>
            <button 
              onClick={handleRestoreFromBackup}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Yedekten Geri Yükle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;