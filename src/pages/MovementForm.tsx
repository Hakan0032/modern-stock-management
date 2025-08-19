import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Material } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';

const MovementForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [formData, setFormData] = useState({
    materialId: searchParams.get('materialId') || '',
    type: searchParams.get('type') || 'IN',
    quantity: '',
    description: '',
    reference: ''
  });

  const movementTypes = [
    { value: 'IN', label: 'Stok Girişi', icon: TrendingUp, color: 'green' },
    { value: 'OUT', label: 'Stok Çıkışı', icon: TrendingDown, color: 'red' }
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (formData.materialId) {
      const material = materials.find(m => m.id === formData.materialId); // UUID karşılaştırması
      setSelectedMaterial(material || null);
    } else {
      setSelectedMaterial(null);
    }
  }, [formData.materialId, materials]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      console.log('Fetching materials...');
      const response = await api.get('/materials');
      console.log('Materials API response:', response.data);
      
      // API response yapısını kontrol et
      let materialsData;
      if (response.data?.data?.data) {
        // Paginated response
        materialsData = response.data.data.data;
      } else if (response.data?.data) {
        // Direct data response
        materialsData = response.data.data;
      } else {
        // Fallback
        materialsData = response.data || [];
      }
      
      console.log('Processed materials data:', materialsData);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
    } catch (error) {
      console.error('Materials fetch error:', error);
      toast.error('Hata', {
        description: 'Malzemeler yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
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
    
    if (!formData.materialId || !formData.quantity || !formData.type) {
      toast.error('Hata', {
        description: 'Lütfen zorunlu alanları doldurun'
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (quantity <= 0) {
      toast.error('Hata', {
        description: 'Miktar 0\'dan büyük olmalıdır'
      });
      return;
    }

    // Çıkış işlemi için stok kontrolü
    if (formData.type === 'OUT' && selectedMaterial) {
      if (quantity > selectedMaterial.currentStock) {
        toast.error('Hata', {
          description: `Yetersiz stok! Mevcut: ${selectedMaterial.currentStock} ${selectedMaterial.unit}`
        });
        return;
      }
    }

    try {
      setSaving(true);
      
      const movementData = {
        materialId: formData.materialId, // UUID olarak bırak, parseInt yapma
        type: formData.type,
        quantity: quantity,
        description: formData.description.trim() || null,
        reference: formData.reference.trim() || null
      };

      await api.post('/movements', movementData);
      
      toast.success('Başarılı', {
        description: `Stok ${formData.type === 'IN' ? 'girişi' : 'çıkışı'} başarıyla kaydedildi`
      });
      
      navigate('/movements');
    } catch (error: any) {
      console.error('Error creating movement:', error);
      const errorData = error.response?.data?.error || error.response?.data?.message;
      const errorMessage = typeof errorData === 'string' ? errorData : 
                          typeof errorData === 'object' && errorData ? 
                          (errorData.message || JSON.stringify(errorData)) : 
                          'Hareket kaydedilirken hata oluştu';
      toast.error('Hata', {
        description: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedMovementType = movementTypes.find(type => type.value === formData.type);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/movements')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Stok Hareketi</h1>
            <p className="text-gray-600 dark:text-gray-300">Stok giriş veya çıkış işlemi yapın</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Movement Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hareket Türü</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movementTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.value;
              return (
                <label
                  key={type.value}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={isSelected}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    isSelected ? `bg-${type.color}-100 dark:bg-${type.color}-900` : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${
                      isSelected ? `text-${type.color}-900 dark:text-${type.color}-100` : 'text-gray-900 dark:text-white'
                    }`}>
                      {type.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type.value === 'IN' ? 'Depoya malzeme girişi' : 'Depodan malzeme çıkışı'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className={`absolute top-2 right-2 w-4 h-4 bg-${type.color}-500 dark:bg-${type.color}-400 rounded-full flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full"></div>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Material Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Malzeme Seçimi</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="materialId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Malzeme *
              </label>
              <select
                id="materialId"
                name="materialId"
                value={formData.materialId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                disabled={loading}
              >
                <option value="">Malzeme seçin</option>
                {Array.isArray(materials) && materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.code} - {material.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{selectedMaterial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedMaterial.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mevcut Stok</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedMaterial.currentStock} {selectedMaterial.unit}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Movement Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hareket Detayları</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Miktar * {selectedMaterial && `(${selectedMaterial.unit})`}
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                required
              />
              {formData.type === 'OUT' && selectedMaterial && parseFloat(formData.quantity) > selectedMaterial.currentStock && (
                <p className="mt-1 text-sm text-red-600">
                  Uyarı: Mevcut stoktan ({selectedMaterial.currentStock} {selectedMaterial.unit}) fazla çıkış yapılamaz
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referans/Belge No
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Örn: FTR-2024-001, İŞ-EMRİ-123"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Hareket hakkında detaylı bilgi..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/movements')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>İptal</span>
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className={`px-6 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 ${
              selectedMovementType?.color === 'green'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovementForm;