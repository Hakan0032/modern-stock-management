import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Machine {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  description: string;
  specifications: string;
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const MachineEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [machine, setMachine] = useState<Machine>({
    id: '',
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    description: '',
    specifications: '',
    location: '',
    purchaseDate: '',
    purchasePrice: 0,
    status: 'active',
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    fetchMachine();
  }, [id]);

  const fetchMachine = async () => {
    try {
      const response = await fetch(`/api/machines/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMachine(data);
      } else {
        toast.error('Makine bilgileri yüklenemedi');
        navigate('/machines');
      }
    } catch (error) {
      console.error('Error fetching machine:', error instanceof Error ? error.message : String(error));
      toast.error('Makine bilgileri yüklenirken hata oluştu');
      navigate('/machines');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMachine(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!machine.name.trim()) {
      toast.error('Makine adı gereklidir');
      return;
    }
    
    if (!machine.model.trim()) {
      toast.error('Model gereklidir');
      return;
    }
    
    if (machine.purchasePrice < 0) {
      toast.error('Satın alma fiyatı negatif olamaz');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/machines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...machine,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Makine başarıyla güncellendi');
        navigate(`/machines/${id}`);
      } else {
        toast.error('Makine güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating machine:', error instanceof Error ? error.message : String(error));
      toast.error('Makine güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Makine bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/machines/${id}`)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Makine Düzenle</h1>
                <p className="text-sm text-gray-500">Makine bilgilerini güncelleyin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/machines/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </button>
              <button
                type="submit"
                form="machine-form"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <form id="machine-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Makine Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={machine.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Makine adını girin"
                  required
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={machine.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Model bilgisini girin"
                  required
                />
              </div>

              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
                  Üretici
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={machine.manufacturer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Üretici firma adını girin"
                />
              </div>

              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={machine.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Seri numarasını girin"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasyon
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={machine.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Makine lokasyonunu girin"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  id="status"
                  name="status"
                  value={machine.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="maintenance">Bakımda</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>

              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={machine.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Satın Alma Fiyatı (₺)
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={machine.purchasePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={machine.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Makine hakkında açıklama girin"
              />
            </div>

            <div>
              <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
                Teknik Özellikler
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={machine.specifications}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teknik özellikler ve spesifikasyonları girin"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MachineEdit;