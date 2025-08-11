import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Save, ArrowLeft } from 'lucide-react';
import { Material } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { cn } from '../utils';

interface MaterialFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  unitPrice: number;
  minLevel: number;
  maxLevel: number;
  supplierId: number | null;
}

const MaterialForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<MaterialFormData>({
    code: '',
    name: '',
    description: '',
    category: 'Hammadde',
    unit: 'Adet',
    unitPrice: 0,
    minLevel: 0,
    maxLevel: 0,
    supplierId: null
  });

  const categories = ['Hammadde', 'Yarı Mamul', 'Mamul', 'Yedek Parça', 'Kimyasal'];
  const units = ['Adet', 'Kg', 'Litre', 'Metre', 'M²', 'M³', 'Ton'];

  useEffect(() => {
    fetchSuppliers();
    if (isEdit) {
      fetchMaterial();
    }
  }, [id, isEdit]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/admin/suppliers');
      setSuppliers(response.data.data || response.data);
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error instanceof Error ? error.message : String(error));
    }
  };

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      const material = response.data.data || response.data;
      
      setFormData({
        code: material.code || '',
        name: material.name || '',
        description: material.description || '',
        category: material.category || 'Hammadde',
        unit: material.unit || 'Adet',
        unitPrice: material.unitPrice || 0,
        minLevel: material.minLevel || 0,
        maxLevel: material.maxLevel || 0,
        supplierId: material.supplierId || null
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast.error('Hata', {
        description: 'Kod ve isim alanları zorunludur'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (isEdit) {
        await api.put(`/materials/${id}`, formData);
        toast.success('Başarılı', {
          description: 'Malzeme başarıyla güncellendi'
        });
      } else {
        await api.post('/materials', formData);
        toast.success('Başarılı', {
          description: 'Malzeme başarıyla oluşturuldu'
        });
      }
      
      navigate('/materials');
    } catch (error: any) {
      toast.error('Hata', {
        description: error.response?.data?.error || 'İşlem sırasında hata oluştu'
      });
    } finally {
      setSubmitting(false);
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/materials')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Malzeme Düzenle' : 'Yeni Malzeme'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Malzeme bilgilerini güncelleyin' : 'Yeni malzeme ekleyin'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Temel Bilgiler
            </h3>
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: MAL-001"
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Malzeme adını girin"
                />
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
                  placeholder="Malzeme açıklaması"
                />
              </div>
            </div>
          </div>

          {/* Category and Unit */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Kategori ve Birim
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Birim
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Birim Fiyat (₺)
                </label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Stok Seviyeleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stok Seviyesi
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
                />
              </div>
              
              <div>
                <label htmlFor="maxLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Stok Seviyesi
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
                />
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tedarikçi
            </h3>
            <div>
              <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-2">
                Ana Tedarikçi
              </label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tedarikçi seçin</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/materials')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2",
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Güncelle' : 'Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;