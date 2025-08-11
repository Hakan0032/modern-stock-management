import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  User,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkOrder {
  id: string;
  orderNumber: string;
  machineId: string;
  machineName: string;
  description: string;
  quantity: number;
  status: string;
  priority: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface BOMItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
  consumed?: number;
}

interface WorkOrderLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [logs, setLogs] = useState<WorkOrderLog[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'logs'>('info');

  useEffect(() => {
    if (id) {
      fetchWorkOrder();
      fetchBOMItems();
      fetchLogs();
    }
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      const response = await fetch(`/api/workorders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrder(data);
      } else {
        toast.error('İş emri bulunamadı');
        navigate('/work-orders');
      }
    } catch (error) {
      console.error('Error fetching work order:', error instanceof Error ? error.message : String(error));
      toast.error('İş emri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchBOMItems = async () => {
    try {
      const response = await fetch(`/api/workorders/${id}/materials`);
      if (response.ok) {
        const data = await response.json();
        setBomItems(data);
      }
    } catch (error) {
      console.error('Error fetching BOM items:', error instanceof Error ? error.message : String(error));
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/workorders/${id}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleStatusChange = async (action: 'start' | 'complete' | 'cancel') => {
    if (!workOrder) return;

    const confirmMessages = {
      start: 'İş emrini başlatmak istediğinizden emin misiniz?',
      complete: 'İş emrini tamamlamak istediğinizden emin misiniz?',
      cancel: 'İş emrini iptal etmek istediğinizden emin misiniz?'
    };

    if (!confirm(confirmMessages[action])) {
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const actionTexts = {
          start: 'başlatıldı',
          complete: 'tamamlandı',
          cancel: 'iptal edildi'
        };
        toast.success(`İş emri ${actionTexts[action]}`);
        fetchWorkOrder();
        fetchLogs();
      } else {
        toast.error('İşlem gerçekleştirilemedi');
      }
    } catch (error) {
      console.error('Error updating work order status:', error instanceof Error ? error.message : String(error));
      toast.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleDelete = async () => {
    if (!workOrder) return;

    if (!confirm('Bu iş emrini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('İş emri başarıyla silindi');
        navigate('/work-orders');
      } else {
        toast.error('İş emri silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting work order:', error instanceof Error ? error.message : String(error));
      toast.error('İş emri silinirken hata oluştu');
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yeni':
        return 'bg-gray-100 text-gray-800';
      case 'Planlandı':
        return 'bg-blue-100 text-blue-800';
      case 'Üretimde':
        return 'bg-orange-100 text-orange-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'İptal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return 'bg-red-100 text-red-800';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Düşük':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Yeni':
        return <FileText className="w-4 h-4" />;
      case 'Planlandı':
        return <Clock className="w-4 h-4" />;
      case 'Üretimde':
        return <Play className="w-4 h-4" />;
      case 'Tamamlandı':
        return <CheckCircle className="w-4 h-4" />;
      case 'İptal':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">İş emri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">İş emri bulunamadı</p>
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
                onClick={() => navigate('/work-orders')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{workOrder.orderNumber}</h1>
                <p className="text-sm text-gray-500">{workOrder.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {workOrder.status === 'Planlandı' && (
                <button
                  onClick={() => handleStatusChange('start')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Başlat</span>
                </button>
              )}
              
              {workOrder.status === 'Üretimde' && (
                <button
                  onClick={() => handleStatusChange('complete')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Tamamla</span>
                </button>
              )}
              
              {(workOrder.status === 'Planlandı' || workOrder.status === 'Üretimde') && (
                <button
                  onClick={() => handleStatusChange('cancel')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>İptal Et</span>
                </button>
              )}
              
              <Link
                to={`/work-orders/${id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </Link>
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Status and Priority */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workOrder.status)}`}>
                  {getStatusIcon(workOrder.status)}
                  <span className="ml-2">{workOrder.status}</span>
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(workOrder.priority)}`}>
                  {workOrder.priority === 'Yüksek' && <AlertTriangle className="w-4 h-4 mr-1" />}
                  {workOrder.priority}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Oluşturulma: {formatDate(workOrder.createdAt)}
              </div>
            </div>
          </div>

          {/* Tabs */}
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
                İş Emri Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Malzemeler
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                İşlem Geçmişi
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Makine
                    </label>
                    <p className="text-gray-900">{workOrder.machineName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miktar
                    </label>
                    <p className="text-gray-900">{workOrder.quantity} adet</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planlanan Başlangıç
                    </label>
                    <p className="text-gray-900">{formatDate(workOrder.plannedStartDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planlanan Bitiş
                    </label>
                    <p className="text-gray-900">{formatDate(workOrder.plannedEndDate)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gerçek Başlangıç
                    </label>
                    <p className="text-gray-900">{formatDate(workOrder.actualStartDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gerçek Bitiş
                    </label>
                    <p className="text-gray-900">{formatDate(workOrder.actualEndDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <p className="text-gray-900">{workOrder.notes || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gerekli Malzemeler</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Malzeme Kodu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Malzeme Adı
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
                      {bomItems.map((item) => {
                        const isAvailable = item.availableStock >= item.requiredQuantity;
                        return (
                          <tr key={item.materialId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.materialCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.materialName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.requiredQuantity} {item.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.availableStock} {item.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isAvailable ? 'Yeterli' : 'Yetersiz'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">İşlem Geçmişi</h3>
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.description}</p>
                          <p className="text-xs text-gray-500">Yapan: {log.userName}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Henüz işlem geçmişi bulunmuyor.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetail;