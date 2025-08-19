import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Settings, 
  Package, 
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react';
import { Machine, BOMItem } from '../types';
import { api } from '../utils/api';
import { formatDate, getStatusColor } from '../utils';
import { toast } from 'sonner';
import BOMEditor from '../components/BOMEditor';

const MachineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'bom' | 'maintenance'>('info');

  useEffect(() => {
    if (id) {
      fetchMachine();
      fetchBOM();
    }
  }, [id]);

  const fetchMachine = async () => {
    try {
      const response = await api.get(`/machines/${id}`);
      setMachine(response.data.data || response.data);
    } catch (error) {
      toast.error('Hata', {
        description: 'Makine bilgileri yüklenirken hata oluştu'
      });
      navigate('/machines');
    }
  };

  const fetchBOM = async () => {
    try {
      const response = await api.get(`/machines/${id}/bom`);
      setBomItems(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching BOM:', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!machine || !confirm('Bu makineyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/machines/${machine.id}`);
      toast.success('Başarılı', {
        description: 'Makine başarıyla silindi'
      });
      navigate('/machines');
    } catch (error) {
      toast.error('Hata', {
        description: 'Makine silinirken hata oluştu'
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.put(`/machines/${machine.id}`, {
        ...machine
      });
      // Status güncelleme simülasyonu
      toast.success('Başarılı', {
        description: 'Makine durumu güncellendi'
      });
    } catch (error) {
      toast.error('Hata', {
        description: 'Makine durumu güncellenirken hata oluştu'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aktif':
        return <CheckCircle className="w-4 h-4" />;
      case 'Bakımda':
        return <Wrench className="w-4 h-4" />;
      case 'Arızalı':
        return <AlertCircle className="w-4 h-4" />;
      case 'Pasif':
        return <Clock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Makine Bulunamadı</h2>
        <p className="text-gray-600 mb-4">Aradığınız makine mevcut değil.</p>
        <button
          onClick={() => navigate('/machines')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Makine Listesine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/machines')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{machine.model}</h1>
            <p className="text-gray-600">ID: {machine.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/machines/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Düzenle</span>
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sil</span>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <span className="text-green-600">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Makine Durumu</h3>
              <p className="text-gray-600">Aktif</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value="Aktif"
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="Arızalı">Arızalı</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Makine Bilgileri
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              BOM (Malzeme Listesi)
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bakım Geçmişi
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Makine ID</label>
                    <p className="text-sm text-gray-900">{machine.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <p className="text-sm text-gray-900">{machine.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oluşturma Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(machine.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="ml-1">Aktif</span>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teknik Özellikler</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Üretici</label>
                    <p className="text-sm text-gray-900">Belirtilmemiş</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <p className="text-sm text-gray-900">{machine.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seri No</label>
                    <p className="text-sm text-gray-900">Belirtilmemiş</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Güncelleme Tarihi</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(machine.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <p className="text-sm text-gray-900">Açıklama bulunmuyor</p>
              </div>
            </div>
          )}

          {activeTab === 'bom' && (
            <BOMEditor
              machineId={machine.id}
              bomItems={bomItems}
              onUpdate={setBomItems}
            />
          )}

          {activeTab === 'maintenance' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bakım Geçmişi</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>Yeni Bakım Kaydı</span>
                </button>
              </div>
              
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz bakım kaydı bulunmuyor</p>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  İlk Bakım Kaydını Ekle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;