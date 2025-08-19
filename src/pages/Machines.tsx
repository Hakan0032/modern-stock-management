import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Wrench,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Machine } from '../types';
import { formatDate } from '../utils';
import { toast } from 'sonner';

// Mock data
const mockMachines: Machine[] = [
  {
    id: 'M001',
    code: 'CNC-001',
    name: 'CNC Torna Tezgahı',
    category: 'production',
    model: 'CNC-2024',
    manufacturer: 'Siemens',
    year: 2024,
    status: 'active',
    location: 'Üretim Hattı 1',
    specifications: 'Güç: 15kW, Kapasite: 500kg, Boyutlar: 2x3x2m',
    maintenanceSchedule: 'Aylık bakım',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'M002',
    code: 'FRZ-002',
    name: 'Freze Tezgahı',
    category: 'production',
    model: 'FRZ-2023',
    manufacturer: 'Haas',
    year: 2023,
    status: 'maintenance',
    location: 'Üretim Hattı 2',
    specifications: 'Güç: 12kW, Kapasite: 300kg, Boyutlar: 1.5x2.5x1.8m',
    maintenanceSchedule: 'Haftalık bakım',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'M003',
    code: 'WLD-003',
    name: 'Kaynak Makinesi',
    category: 'welding',
    model: 'WLD-2024',
    manufacturer: 'Lincoln',
    year: 2024,
    status: 'active',
    location: 'Kaynak Atölyesi',
    specifications: 'Güç: 8kW, Kapasite: 200A, Boyutlar: 1x1.5x1.2m',
    maintenanceSchedule: 'Aylık bakım',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-11-20T09:15:00Z'
  },
  {
    id: 'M004',
    code: 'PRS-004',
    name: 'Pres Makinesi',
    category: 'pressing',
    model: 'PRS-2023',
    manufacturer: 'Schuler',
    year: 2023,
    status: 'inactive',
    location: 'Pres Atölyesi',
    specifications: 'Güç: 20kW, Kapasite: 1000kg, Boyutlar: 2.5x3x2.5m',
    maintenanceSchedule: 'Aylık bakım',
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-10-01T16:45:00Z'
  }
];

const Machines: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>(mockMachines.map(machine => ({
    ...machine,
    id: machine.id === 'M001' ? '550e8400-e29b-41d4-a716-446655440021' :
        machine.id === 'M002' ? '550e8400-e29b-41d4-a716-446655440022' :
        machine.id === 'M003' ? '550e8400-e29b-41d4-a716-446655440023' :
        machine.id === 'M004' ? '550e8400-e29b-41d4-a716-446655440024' :
        machine.id
  })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Filter mock data based on search and status
    let filteredMachines = mockMachines;
    
    if (searchTerm) {
      filteredMachines = filteredMachines.filter(machine => 
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filteredMachines = filteredMachines.filter(machine => 
        machine.status === statusFilter.toLowerCase()
      );
    }
    
    setMachines(filteredMachines);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    console.log('Deleting machine with ID:', id);
    
    if (!confirm('Bu makineyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/machines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMachines(machines.filter(machine => machine.id !== id));
        toast.success('Makine başarıyla silindi');
      } else if (response.status === 404) {
        toast.error('Makine bulunamadı');
      } else if (response.status === 500) {
        toast.error('Sunucu hatası oluştu');
      } else {
        toast.error('Makine silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Ağ hatası oluştu');
    }
  };

  const handleEdit = (id: string) => {
    console.log('🟡 MACHINES EDIT BUTTON CLICKED - Machine ID:', id);
    const machine = machines.find(m => m.id === id);
    if (machine) {
      console.log('🟡 Machine found:', machine.name);
      toast.info('Bilgi', {
        description: `${machine.name} makinesi düzenleniyor...`
      });
      // Here you would typically navigate to edit page or open edit modal
    } else {
      console.log('🟡 Machine NOT found for ID:', id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Aktif';
      case 'Maintenance':
        return 'Bakımda';
      case 'Inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Makineler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Makine & BOM Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300">Makineleri ve malzeme listelerini yönetin</p>
        </div>
        <Link
          to="/machines/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Makine</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Makine ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Active">Aktif</option>
            <option value="Maintenance">Bakımda</option>
            <option value="Inactive">Pasif</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Makine</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{machines.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aktif Makine</p>
              <p className="text-2xl font-bold text-green-600">
                {machines.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bakımda</p>
              <p className="text-2xl font-bold text-yellow-600">
                {machines.filter(m => m.status === 'maintenance').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pasif</p>
              <p className="text-2xl font-bold text-red-600">
                {machines.filter(m => m.status === 'inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Machines Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Makine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kurulum Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Son Bakım
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {machines.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Henüz makine bulunmuyor</p>
                    </td>
                  </tr>
              ) : (
                machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {machine.model}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{machine.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {machine.model}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(machine.status || 'Active')}`}>
                        {getStatusText(machine.status || 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(machine.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className="text-gray-400">-</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/machines/${machine.id}`}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded cursor-pointer transition-colors"
                          title="Görüntüle & BOM"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/machines/${machine.id}/edit`}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded cursor-pointer transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(machine.id)}
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
    </div>
  );
};

export default Machines;