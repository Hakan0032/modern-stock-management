import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Kategori adı gereklidir');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        // Update existing category
        const response = await api.put(`/categories/${editingCategory.id}`, formData);
        if (response.data.success) {
          toast.success('Kategori başarıyla güncellendi');
          setEditingCategory(null);
          setFormData({ name: '', description: '' });
          fetchCategories();
          onCategoryChange();
        }
      } else {
        // Create new category
        const response = await api.post('/categories', formData);
        if (response.data.success) {
          toast.success('Kategori başarıyla oluşturuldu');
          setFormData({ name: '', description: '' });
          fetchCategories();
          onCategoryChange();
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.error || 'Kategori kaydedilirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await api.delete(`/categories/${categoryId}`);
      if (response.data.success) {
        toast.success('Kategori başarıyla silindi');
        fetchCategories();
        onCategoryChange();
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.error || 'Kategori silinirken hata oluştu';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Kategori Yönetimi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kategori adını girin"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kategori açıklaması (opsiyonel)"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors",
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Ekle')}
              </button>
              
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              )}
            </div>
          </form>

          {/* Categories List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Mevcut Kategoriler</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Kategoriler yükleniyor...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz kategori bulunmuyor
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;