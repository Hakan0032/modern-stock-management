import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Material, BOMItem } from '../types';
import { toast } from 'sonner';

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
      const response = await fetch('/api/materials');
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleMaterialSelect = (materialId: string, isEdit = false) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      const itemData = {
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        unit: material.unit,
        unitPrice: material.unitPrice
      };
      
      if (isEdit) {
        setEditItem(prev => ({ ...prev, ...itemData }));
      } else {
        setNewItem(prev => ({ ...prev, ...itemData }));
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItem.materialId || !newItem.quantity || newItem.quantity <= 0) {
      toast.error('Lütfen malzeme seçin ve geçerli bir miktar girin');
      return;
    }

    const item: BOMItem = {
      id: `bom_${Date.now()}`,
      machineId: machineId,
      materialId: newItem.materialId!,
      materialCode: newItem.materialCode!,
      materialName: newItem.materialName!,
      quantity: newItem.quantity!,
      unit: newItem.unit!,
      unitPrice: newItem.unitPrice!,
      notes: newItem.notes
    };

    try {
      const response = await fetch(`/api/machines/${machineId}/bom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const updatedItems = [...bomItems, item];
        onUpdate(updatedItems);
        setNewItem({ materialId: '', quantity: 1, notes: '' });
        setIsAddingItem(false);
        toast.success('Malzeme BOM listesine eklendi');
      } else {
        toast.error('Malzeme eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error adding BOM item:', error instanceof Error ? error.message : String(error));
      toast.error('Malzeme eklenirken hata oluştu');
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editItem.quantity || editItem.quantity <= 0) {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    try {
      const response = await fetch(`/api/machines/${machineId}/bom/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editItem),
      });

      if (response.ok) {
        const updatedItems = bomItems.map(item => 
          item.id === itemId ? { ...item, ...editItem } : item
        );
        onUpdate(updatedItems);
        setEditingItem(null);
        setEditItem({});
        toast.success('Malzeme güncellendi');
      } else {
        toast.error('Malzeme güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating BOM item:', error instanceof Error ? error.message : String(error));
      toast.error('Malzeme güncellenirken hata oluştu');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bu malzemeyi BOM listesinden kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/machines/${machineId}/bom/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedItems = bomItems.filter(item => item.id !== itemId);
        onUpdate(updatedItems);
        toast.success('Malzeme BOM listesinden kaldırıldı');
      } else {
        toast.error('Malzeme kaldırılırken hata oluştu');
      }
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
      unitPrice: item.unitPrice,
      notes: item.notes
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditItem({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
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
                {materials.map(material => (
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
                  Birim Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
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
              {bomItems.map((item) => (
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
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
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Toplam Maliyet:
                </td>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">
                  {formatCurrency(
                    bomItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)
                  )}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default BOMEditor;