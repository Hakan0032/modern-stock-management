import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Package, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CategoryModal from '../components/CategoryModal';
import { api } from '../utils/api';
import type { Material } from '../types';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState(['Elektrik', 'Panel', 'Mekanik', 'Diğer']);

  // Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching materials from API...');
        const response = await api.get('/materials');
        console.log('📦 API Response:', response.data);
        
        if (response.data.success) {
          // The API returns data in response.data.data.data structure
          const materialsData = response.data.data?.data || response.data.data || [];
          console.log('📋 Materials data:', materialsData);
          
          // Ensure materialsData is an array
          if (Array.isArray(materialsData)) {
            setMaterials(materialsData);
          } else {
            console.error('❌ Materials data is not an array:', materialsData);
            setMaterials([]);
          }
        } else {
          setError(response.data.error || 'Malzemeler yüklenirken hata oluştu');
        }
      } catch (err: any) {
        console.error('❌ Materials fetch error:', err);
        setError(err.response?.data?.error || 'Malzemeler yüklenirken hata oluştu');
        // Ensure materials is always an array even on error
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Utility functions
  const getStockLevelColor = (currentStock: number, minStockLevel: number) => {
    if (currentStock <= minStockLevel) {
      return 'text-red-600';
    } else if (currentStock <= minStockLevel * 1.5) {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  // Filter materials based on search and filters
  const filteredMaterials = useMemo(() => {
    // Ensure materials is always an array
    if (!Array.isArray(materials)) {
      console.error('❌ Materials is not an array in filteredMaterials:', materials);
      return [];
    }

    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(material => 
        material.category === categoryFilter
      );
    }

    if (stockFilter) {
      filtered = filtered.filter(material => {
        const stockLevel = material.currentStock <= material.minStockLevel ? 'critical' :
                         material.currentStock <= material.minStockLevel * 1.5 ? 'low' :
                         material.currentStock >= material.maxStockLevel * 0.8 ? 'high' : 'normal';
        return stockLevel === stockFilter;
      });
    }

    return filtered;
  }, [materials, searchTerm, categoryFilter, stockFilter]);

  const handleDelete = async (id: string) => {
    console.log('🔴 DELETE BAŞLADI - Material ID:', id);
    
    if (!confirm('Bu malzemeyi silmek istediğinizden emin misiniz?')) {
      console.log('🔴 DELETE İPTAL EDİLDİ');
      return;
    }

    try {
      console.log('🔴 API ÇAĞRISI YAPILIYOR:', `/materials/${id}`);
      
      const response = await api.delete(`/materials/${id}`);
      console.log('🔴 API RESPONSE:', response);
      
      if (response.status === 200 && response.data?.success) {
        console.log('🔴 SİLME BAŞARILI - Liste güncelleniyor');
        
        // Update the materials list by removing the deleted item
        setMaterials(prevMaterials => {
          const filtered = prevMaterials.filter(material => material.id !== id);
          console.log('🔴 YENİ LİSTE UZUNLUĞU:', filtered.length);
          return filtered;
        });
        
        toast.success('Malzeme başarıyla silindi');
      } else {
        console.error('🔴 SİLME BAŞARISIZ:', response.data);
        toast.error('Silme işlemi başarısız');
      }
    } catch (err: any) {
      console.error('🔴 SİLME HATASI:', err);
      toast.error('Silme işlemi sırasında hata oluştu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCategoryChange = () => {
    // This function will be called when categories are updated
    // In a real app, you would fetch categories from the API
    console.log('Categories updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Malzemeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Yükleme Hatası</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Malzeme Kataloğu</h1>
          <p className="text-gray-600 dark:text-gray-300">Tüm malzemeleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Kategori Yönetimi</span>
          </button>
          <Link
            to="/materials/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Malzeme</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tüm Stok Seviyeleri</option>
            <option value="critical">Kritik</option>
            <option value="low">Düşük</option>
            <option value="normal">Normal</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Malzeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stok Durumu
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Henüz malzeme bulunmuyor</p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {material.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {material.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {material.currentStock <= material.minStockLevel && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <div className={`text-sm font-medium ${getStockLevelColor(material.currentStock, material.minStockLevel)}`}>
                            {material.currentStock} {material.unit}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Min: {material.minStockLevel} {material.unit}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/materials/${material.id}`}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded cursor-pointer transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/materials/${material.id}/edit`}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded cursor-pointer transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(material.id)}
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

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default Materials;