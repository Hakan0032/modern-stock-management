import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Edit, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Material, MaterialMovement } from '../types';
import { api } from '../utils/api';
import { formatDate, formatRelativeTime, getStockLevelColor } from '../utils';
import { toast } from 'sonner';

const MaterialDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [movements, setMovements] = useState<MaterialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMaterial();
      fetchMovements();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      setMaterial(response.data.data || response.data);
    } catch (error) {
      toast.error('Hata', {
        description: 'Malzeme bilgileri yüklenirken hata oluştu'
      });
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setMovementsLoading(true);
      const response = await api.get(`/movements/material/${id}?limit=20`);
      setMovements(response.data.data || response.data);
    } catch (error) {
      console.error('Hareketler yüklenirken hata:', error instanceof Error ? error.message : String(error));
    } finally {
      setMovementsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Malzeme bulunamadı</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{material.name}</h1>
            <p className="text-gray-600">{material.code}</p>
          </div>
        </div>
        <Link
          to={`/materials/${id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Düzenle</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Material Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Malzeme Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Malzeme Kodu
                </label>
                <p className="text-gray-900 font-medium">{material.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Kategori
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {material.category}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Birim
                </label>
                <p className="text-gray-900">{material.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Birim Fiyat
                </label>

              </div>
              {material.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Açıklama
                  </label>
                  <p className="text-gray-900">{material.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Stok Seviyeleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Mevcut Stok
                </label>
                <p className={`text-2xl font-bold ${getStockLevelColor(material.currentStock, material.minStockLevel)}`}>
                  {material.currentStock} {material.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Minimum Seviye
                </label>
                <p className="text-xl font-medium text-gray-900">
                  {material.minStockLevel} {material.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Maksimum Seviye
                </label>
                <p className="text-xl font-medium text-gray-900">
                  {material.maxStockLevel} {material.unit}
                </p>
              </div>
            </div>
            
            {material.currentStock <= material.minStockLevel && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">Kritik Stok Seviyesi!</p>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Bu malzeme minimum stok seviyesinin altında. Yeniden sipariş vermeyi düşünün.
                </p>
              </div>
            )}
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Son Hareketler
              </h2>
            </div>
            <div className="p-6">
              {movementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz hareket bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          movement.type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {movement.type === 'IN' ? 'Giriş' : 'Çıkış'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {movement.reason || 'Açıklama yok'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity} {material.unit}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(movement.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {movements.length >= 20 && (
                    <div className="text-center pt-4">
                      <Link
                        to={`/movements?materialId=${id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Tüm hareketleri görüntüle
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Value */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stok Değeri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Toplam Değer
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {material.currentStock}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Birim Fiyat:</span>

                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Miktar:</span>
                  <span className="font-medium">{material.currentStock} {material.unit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          {material.supplier && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Ana Tedarikçi
              </h3>
              <div>
                <p className="font-medium text-gray-900">{material.supplier}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tedarikçi bilgileri yükleniyor...
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hızlı İşlemler
            </h3>
            <div className="space-y-3">
              <Link
                to={`/movements/new?materialId=${id}&type=IN`}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Stok Girişi</span>
              </Link>
              <Link
                to={`/movements/new?materialId=${id}&type=OUT`}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Stok Çıkışı</span>
              </Link>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bilgiler
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Oluşturulma:</span>
                <span className="font-medium">{formatDate(material.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Son Güncelleme:</span>
                <span className="font-medium">{formatDate(material.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;