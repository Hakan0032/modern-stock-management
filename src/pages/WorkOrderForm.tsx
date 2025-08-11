import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface Machine {
  id: string;
  name: string;
  model: string;
  status: string;
}

interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface BOMItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
}

interface WorkOrderFormData {
  orderNumber: string;
  machineId: string;
  description: string;
  quantity: number;
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  plannedStartDate: string;
  plannedEndDate: string;
  notes: string;
  bomItems: BOMItem[];
}

const WorkOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState<WorkOrderFormData>({
    orderNumber: '',
    machineId: '',
    description: '',
    quantity: 1,
    priority: 'Orta',
    plannedStartDate: '',
    plannedEndDate: '',
    notes: '',
    bomItems: []
  });

  useEffect(() => {
    fetchMachines();
    fetchMaterials();
    generateOrderNumber();
  }, []);

  useEffect(() => {
    if (formData.machineId) {
      fetchMachineBOM(formData.machineId);
    }
  }, [formData.machineId]);

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines');
      if (response.ok) {
        const data = await response.json();
        setMachines(data.filter((m: Machine) => m.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching machines:', error instanceof Error ? error.message : String(error));
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error instanceof Error ? error.message : String(error));
    }
  };

  const fetchMachineBOM = async (machineId: string) => {
    try {
      const response = await fetch(`/api/machines/${machineId}/bom`);
      if (response.ok) {
        const bomData = await response.json();
        const bomItems = bomData.map((item: any) => ({
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          requiredQuantity: item.quantity * formData.quantity,
          unit: item.unit,
          availableStock: materials.find(m => m.id === item.materialId)?.currentStock || 0
        }));
        setFormData(prev => ({ ...prev, bomItems }));
      }
    } catch (error) {
      console.error('Error fetching machine BOM:', error instanceof Error ? error.message : String(error));
    }
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const orderNumber = `WO${year}${month}${day}${time}`;
    setFormData(prev => ({ ...prev, orderNumber }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const updateBOMQuantities = (newQuantity: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: newQuantity,
      bomItems: prev.bomItems.map(item => ({
        ...item,
        requiredQuantity: item.requiredQuantity / prev.quantity * newQuantity
      }))
    }));
  };

  const checkStockAvailability = () => {
    const insufficientItems = formData.bomItems.filter(
      item => item.requiredQuantity > item.availableStock
    );
    return insufficientItems;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderNumber.trim()) {
      toast.error('İş emri numarası gereklidir');
      return;
    }
    
    if (!formData.machineId) {
      toast.error('Makine seçimi gereklidir');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Açıklama gereklidir');
      return;
    }
    
    if (formData.quantity <= 0) {
      toast.error('Miktar 0\'dan büyük olmalıdır');
      return;
    }
    
    if (!formData.plannedStartDate) {
      toast.error('Planlanan başlangıç tarihi gereklidir');
      return;
    }

    const insufficientItems = checkStockAvailability();
    if (insufficientItems.length > 0) {
      const itemNames = insufficientItems.map(item => item.materialName).join(', ');
      if (!confirm(`Şu malzemeler için yeterli stok yok: ${itemNames}. Devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'Yeni',
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success('İş emri başarıyla oluşturuldu');
        navigate('/work-orders');
      } else {
        toast.error('İş emri oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating work order:', error instanceof Error ? error.message : String(error));
      toast.error('İş emri oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/work-orders')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni İş Emri</h1>
                <p className="text-sm text-gray-500">Yeni üretim iş emri oluşturun</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/work-orders')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </button>
              <button
                type="submit"
                form="work-order-form"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Oluşturuluyor...' : 'Oluştur'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="work-order-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  İş Emri Numarası *
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Otomatik oluşturuldu"
                  required
                />
              </div>

              <div>
                <label htmlFor="machineId" className="block text-sm font-medium text-gray-700 mb-2">
                  Makine *
                </label>
                <select
                  id="machineId"
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Makine seçin</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name} - {machine.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Üretim Miktarı *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => updateBOMQuantities(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Öncelik
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Düşük">Düşük</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek</option>
                </select>
              </div>

              <div>
                <label htmlFor="plannedStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Planlanan Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  id="plannedStartDate"
                  name="plannedStartDate"
                  value={formData.plannedStartDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="plannedEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Planlanan Bitiş Tarihi
                </label>
                <input
                  type="date"
                  id="plannedEndDate"
                  name="plannedEndDate"
                  value={formData.plannedEndDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="İş emri açıklaması"
                required
              />
            </div>

            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ek notlar (opsiyonel)"
              />
            </div>
          </div>

          {/* Material Requirements */}
          {formData.bomItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Malzeme Gereksinimleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Malzeme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gerekli Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mevcut Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.bomItems.map((item, index) => {
                      const isInsufficient = item.requiredQuantity > item.availableStock;
                      return (
                        <tr key={index} className={isInsufficient ? 'bg-red-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.materialName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.materialCode}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.requiredQuantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.availableStock} {item.unit}
                          </td>
                          <td className="px-6 py-4">
                            {isInsufficient ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Yetersiz Stok
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yeterli
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {checkStockAvailability().length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Stok Uyarısı
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Bazı malzemeler için yeterli stok bulunmuyor. İş emrini oluşturmadan önce stok durumunu kontrol edin.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default WorkOrderForm;