import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Material, BOMItem } from '../types';
import { toast } from 'sonner';
import { api } from '../utils/api';

interface BOMEditorProps {
  machineId: string;
  bomItems: BOMItem[];
  onUpdate: (items: BOMItem[]) => void;
}

const BOMEditor: React.FC<BOMEditorProps> = ({ machineId, bomItems, onUpdate }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BOMItem>>({
    materialId: '',
    quantity: 1,
    notes: ''
  });
  const [editItem, setEditItem] = useState<Partial<BOMItem>>({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      
      // Comprehensive response validation
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response structure');
      }
      
      // Extract materials data with multiple fallback paths
      let materialsData = [];
      if (response.data && typeof response.data === 'object') {
        if (response.data.success && response.data.data) {
          materialsData = response.data.data.data || response.data.data || [];
        } else {
          materialsData = response.data.data || response.data || [];
        }
      }
      
      // Ensure materialsData is an array and validate each item
      if (Array.isArray(materialsData)) {
        const validMaterials = materialsData.filter(material => 
          material && 
          typeof material === 'object' && 
          material.id && 
          typeof material.id === 'string' &&
          material.code && 
          typeof material.code === 'string' &&
          material.name && 
          typeof material.name === 'string'
        );
        setMaterials(validMaterials);
      } else {
        console.warn('Materials data is not an array:', materialsData);
        setMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching materials:', error instanceof Error ? error.message : String(error));
      setMaterials([]); // Set empty array on error
      toast.error('Malzemeler yüklenirken hata oluştu');
    }
  };

  const handleMaterialSelect = (materialId: string, isEdit = false) => {
    // Comprehensive input validation
    if (!materialId || typeof materialId !== 'string' || materialId.trim() === '') {
      console.warn('Invalid material ID provided:', materialId);
      return;
    }
    
    // Ensure materials array is valid
    if (!Array.isArray(materials) || materials.length === 0) {
      console.warn('Materials array is not available or empty');
      toast.error('Malzeme listesi yüklenemedi');
      return;
    }
    
    const material = materials.find(m => 
      m && 
      typeof m === 'object' && 
      m.id === materialId
    );
    
    // Comprehensive material validation
    if (material && 
        material.id && 
        typeof material.id === 'string' &&
        material.code && 
        typeof material.code === 'string' &&
        material.name && 
        typeof material.name === 'string') {
      
      const itemData = {
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        unit: (material.unit && typeof material.unit === 'string') ? material.unit : 'Adet'
      };
      
      try {
        if (isEdit) {
          setEditItem(prev => ({ ...prev, ...itemData }));
        } else {
          setNewItem(prev => ({ ...prev, ...itemData }));
        }
      } catch (error) {
        console.error('Error updating item data:', error);
        toast.error('Malzeme seçimi sırasında hata oluştu');
      }
    } else {
      console.warn('Invalid or incomplete material selected:', material);
      toast.error('Seçilen malzeme geçersiz');
    }
  };

  const handleAddItem = async () => {
    // Comprehensive input validation
    if (!machineId || typeof machineId !== 'string' || machineId.trim() === '') {
      console.error('Invalid machine ID:', machineId);
      toast.error('Geçersiz makine ID');
      return;
    }
    
    // Validate newItem object
    if (!newItem || typeof newItem !== 'object') {
      console.error('Invalid newItem object:', newItem);
      toast.error('Geçersiz malzeme bilgileri');
      return;
    }
    
    // Validate required fields
    if (!newItem.materialId || typeof newItem.materialId !== 'string' || newItem.materialId.trim() === '') {
      toast.error('Lütfen bir malzeme seçin');
      return;
    }
    
    if (!newItem.quantity || typeof newItem.quantity !== 'number' || newItem.quantity <= 0 || !isFinite(newItem.quantity)) {
      toast.error('Lütfen geçerli bir miktar girin');
      return;
    }

    if (!newItem.materialCode || typeof newItem.materialCode !== 'string' || newItem.materialCode.trim() === '') {
      toast.error('Malzeme kodu eksik');
      return;
    }
    
    if (!newItem.materialName || typeof newItem.materialName !== 'string' || newItem.materialName.trim() === '') {
      toast.error('Malzeme adı eksik');
      return;
    }

    // Create validated item object
    const item: BOMItem = {
      id: `bom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      machineId: machineId.trim(),
      materialId: newItem.materialId.trim(),
      materialCode: newItem.materialCode.trim(),
      materialName: newItem.materialName.trim(),
      quantity: newItem.quantity,
      unit: (newItem.unit && typeof newItem.unit === 'string') ? newItem.unit.trim() : 'Adet',
      notes: (newItem.notes && typeof newItem.notes === 'string') ? newItem.notes.trim() : ''
    };

    try {
      const response = await api.post(`/machines/${machineId}/bom`, item);
      
      // Validate API response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response');
      }
      
      // Safely update the items array with validation
      const currentItems = Array.isArray(bomItems) ? bomItems.filter(item => 
        item && typeof item === 'object' && item.id
      ) : [];
      
      const updatedItems = [...currentItems, item];
      
      // Validate onUpdate function
      if (typeof onUpdate === 'function') {
        onUpdate(updatedItems);
      } else {
        console.error('onUpdate is not a function:', onUpdate);
        throw new Error('Update function is not available');
      }
      
      // Reset form state
      setNewItem({ materialId: '', quantity: 1, notes: '' });
      setIsAddingItem(false);
      toast.success('Malzeme BOM listesine eklendi');
    } catch (error) {
      console.error('Error adding BOM item:', error instanceof Error ? error.message : String(error));
      toast.error('Malzeme eklenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editItem.quantity || editItem.quantity <= 0) {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    if (!itemId) {
      toast.error('Geçersiz öğe ID');
      return;
    }

    try {
      const response = await api.put(`/machines/${machineId}/bom/${itemId}`, editItem);
      
      // Safely update the items array
      const currentItems = Array.isArray(bomItems) ? bomItems : [];
      const updatedItems = currentItems.map(item => 
        item?.id === itemId ? { ...item, ...editItem } : item
      ).filter(Boolean); // Remove any null/undefined items
      
      onUpdate(updatedItems);
      setEditingItem(null);
      setEditItem({});
      toast.success('Malzeme güncellendi');
    } catch (error) {
      console.error('Error updating BOM item:', error instanceof Error ? error.message : String(error));
      toast.error('Malzeme güncellenirken hata oluştu');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!itemId) {
      toast.error('Geçersiz öğe ID');
      return;
    }
    
    if (!confirm('Bu malzemeyi BOM listesinden kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await api.delete(`/machines/${machineId}/bom/${itemId}`);
      
      // Safely update the items array
      const currentItems = Array.isArray(bomItems) ? bomItems : [];
      const updatedItems = currentItems.filter(item => item?.id !== itemId);
      
      onUpdate(updatedItems);
      toast.success('Malzeme BOM listesinden kaldırıldı');
    } catch (error) {
      console.error('Error deleting BOM item:', error instanceof Error ? error.message : String(error));
      toast.error('Malzeme kaldırılırken hata oluştu');
    }
  };

  const startEdit = (item: BOMItem) => {
    setEditingItem(item.id);
    setEditItem({
      materialId: item.materialId,
      materialCode: item.materialCode,
      materialName: item.materialName,
      quantity: item.quantity,
      unit: item.unit,

      notes: item.notes
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditItem({});
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Malzeme Listesi (BOM)</h3>
        <button
          onClick={() => setIsAddingItem(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Malzeme Ekle</span>
        </button>
      </div>

      {isAddingItem && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Yeni Malzeme Ekle</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Malzeme</label>
              <select
                value={newItem.materialId || ''}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Malzeme seçin</option>
                {Array.isArray(materials) && materials.filter(material => 
                  material && 
                  typeof material === 'object' && 
                  material.id && 
                  material.code && 
                  material.name
                ).map(material => (
                  <option key={material.id} value={material.id}>
                    {material.code} - {material.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Miktar</label>
              <input
                type="number"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Miktar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
              <input
                type="text"
                value={newItem.notes || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Opsiyonel notlar"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItem({ materialId: '', quantity: 1, notes: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      {bomItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Bu makine için henüz malzeme listesi tanımlanmamış</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Malzeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birim
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notlar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(bomItems) && bomItems.filter(item => 
                item && 
                typeof item === 'object' && 
                item.id && 
                item.materialName && 
                item.materialCode
              ).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
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
                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <input
                        type="number"
                        value={editItem.quantity || ''}
                        onChange={(e) => setEditItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.unit}
                  </td>

                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        value={editItem.notes || ''}
                        onChange={(e) => setEditItem(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Notlar"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{item.notes || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {editingItem === item.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUpdateItem(item.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default BOMEditor;