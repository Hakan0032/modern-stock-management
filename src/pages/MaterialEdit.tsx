import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Material, Supplier } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import ErrorBoundary from '../components/ErrorBoundary';

const MaterialEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    unitPrice: '',
    minLevel: '',
    maxLevel: '',
    supplierId: ''
  });

  const categories = [
    'Mermer Blok',
    'Kesici Takım',
    'Yedek Parça',
    'Kimyasal',
    'Aşındırıcı',
    'Elektrik Malzemesi',
    'Hidrolik Malzeme',
    'Güvenlik Ekipmanı',
    'Diğer'
  ];

  const units = [
    'Adet',
    'Kg',
    'Ton',
    'Metre',
    'M²',
    'M³',
    'Litre',
    'Paket',
    'Kutu'
  ];

  useEffect(() => {
    if (id) {
      fetchMaterial();
      fetchSuppliers();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      const material = response.data.data || response.data;
      
      setFormData({
        code: material.code || '',
        name: material.name || '',
        description: material.description || '',
        category: material.category || '',
        unit: material.unit || '',
        unitPrice: material.unitPrice?.toString() || '',
        minLevel: material.minLevel?.toString() || '',
        maxLevel: material.maxLevel?.toString() || '',
        supplierId: material.supplierId?.toString() || ''
      });
    } catch (error) {
      toast.error('Hata', {
        description: 'Malzeme bilgileri yüklenirken hata oluştu'
      });
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/admin/suppliers');
      const suppliersData = response.data.data || response.data;
      
      // Ensure suppliers is always an array
      if (Array.isArray(suppliersData)) {
        setSuppliers(suppliersData);
      } else {
        console.error('❌ Suppliers API response is not an array:', suppliersData);
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error instanceof Error ? error.message : String(error));
      setSuppliers([]); // Ensure suppliers is always an array on error
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim() || !formData.category || !formData.unit) {
      toast.error('Hata', {
        description: 'Lütfen zorunlu alanları doldurun'
      });
      return;
    }

    if (parseFloat(formData.unitPrice) <= 0) {
      toast.error('Hata', {
        description: 'Birim fiyat 0\'dan büyük olmalıdır'
      });
      return;
    }

    if (parseFloat(formData.minLevel) >= parseFloat(formData.maxLevel)) {
      toast.error('Hata', {
        description: 'Maksimum seviye minimum seviyeden büyük olmalıdır'
      });
      return;
    }

    try {
      setSaving(true);
      
      const materialData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        unit: formData.unit,
        unitPrice: parseFloat(formData.unitPrice),
        minLevel: parseFloat(formData.minLevel),
        maxLevel: parseFloat(formData.maxLevel),
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null
      };

      await api.put(`/materials/${id}`, materialData);
      
      toast.success('Başarılı', {
        description: 'Malzeme başarıyla güncellendi'
      });
      
      navigate(`/materials/${id}`);
    } catch (error: any) {
      console.error('Error updating material:', error);
      const errorData = error.response?.data?.error || error.response?.data?.message;
      const errorMessage = typeof errorData === 'string' ? errorData : 
                          typeof errorData === 'object' && errorData ? 
                          (errorData.message || JSON.stringify(errorData)) : 
                          'Malzeme güncellenirken hata oluştu';
      toast.error('Hata', {
        description: errorMessage
      });
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/materials/${id}`)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Malzeme Düzenle</h1>
            <p className="text-gray-600">Malzeme bilgilerini güncelleyin</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Malzeme Kodu *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: MRM-001"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Malzeme Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Malzeme adını girin"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Birim *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Birim seçin</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Birim Fiyat (₺) *
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-2">
                Ana Tedarikçi
              </label>
              <ErrorBoundary fallback={<div className="text-red-500 text-sm">Tedarikçi listesi yüklenemedi</div>}>
                <select
                  id="supplierId"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tedarikçi seçin</option>
                  {(Array.isArray(suppliers) ? suppliers : []).map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </ErrorBoundary>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Malzeme hakkında detaylı bilgi..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Stok Seviyeleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Seviye *
              </label>
              <input
                type="number"
                id="minLevel"
                name="minLevel"
                value={formData.minLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label htmlFor="maxLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Seviye *
              </label>
              <input
                type="number"
                id="maxLevel"
                name="maxLevel"
                value={formData.maxLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/materials/${id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>İptal</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialEdit;