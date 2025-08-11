import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { WorkOrder } from '../types';
import { api } from '../utils/api';
import { formatDate, formatRelativeTime, getPriorityColor, getStatusColor } from '../utils';
import { toast } from 'sonner';

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchWorkOrders();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await api.get(`/workorders?${params.toString()}`);
      
      // Handle nested API response structure
      let workOrdersData = [];
      if (response.data?.success && response.data?.data?.data) {
        workOrdersData = response.data.data.data;
      } else if (Array.isArray(response.data)) {
        workOrdersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        workOrdersData = response.data.data;
      }
      
      setWorkOrders(Array.isArray(workOrdersData) ? workOrdersData : []);
    } catch (error) {
      console.error('Error fetching work orders:', error instanceof Error ? error.message : String(error));
      setWorkOrders([]); // Ensure workOrders is always an array
      toast.error('Hata', {
        description: 'İş emirleri yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, action: 'start' | 'complete' | 'cancel') => {
    try {
      await api.patch(`/workorders/${id}/${action}`);
      toast.success('Başarılı', {
        description: `İş emri ${action === 'start' ? 'başlatıldı' : action === 'complete' ? 'tamamlandı' : 'iptal edildi'}`
      });
      fetchWorkOrders();
    } catch (error: any) {
      toast.error('Hata', {
        description: error.response?.data?.error || 'İşlem gerçekleştirilemedi'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu iş emrini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/workorders/${id}`);
      toast.success('Başarılı', {
        description: 'İş emri başarıyla silindi'
      });
      fetchWorkOrders();
    } catch (error) {
      toast.error('Hata', {
        description: 'İş emri silinirken hata oluştu'
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'Planlanan';
      case 'IN_PROGRESS':
        return 'Devam Eden';
      case 'COMPLETED':
        return 'Tamamlanan';
      case 'CANCELLED':
        return 'İptal Edilen';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    return priority;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İş Emri Yönetimi</h1>
          <p className="text-gray-600">Üretim iş emirlerini planlayın ve takip edin</p>
        </div>
        <Link
          to="/work-orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni İş Emri</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="İş emri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Yeni">Yeni</option>
            <option value="Planlandı">Planlanan</option>
            <option value="Üretimde">Devam Eden</option>
            <option value="Tamamlandı">Tamamlanan</option>
            <option value="İptal">İptal Edilen</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İş Emri</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(workOrders) ? workOrders.length : 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planlanan</p>
              <p className="text-2xl font-bold text-blue-600">
                {Array.isArray(workOrders) ? workOrders.filter(wo => wo.status === 'PLANNED').length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Devam Eden</p>
              <p className="text-2xl font-bold text-orange-600">
                {Array.isArray(workOrders) ? workOrders.filter(wo => wo.status === 'IN_PROGRESS').length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">
                {Array.isArray(workOrders) ? workOrders.filter(wo => wo.status === 'COMPLETED').length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İş Emri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Makine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öncelik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planlanan Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(workOrders) || workOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz iş emri bulunmuyor</p>
                  </td>
                </tr>
              ) : (
                workOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {workOrder.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workOrder.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {workOrder.machineName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                        {getStatusIcon(workOrder.status)}
                        <span className="ml-1">{getStatusText(workOrder.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                        {workOrder.priority === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {getPriorityText(workOrder.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {workOrder.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(workOrder.plannedStartDate)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/work-orders/${workOrder.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {workOrder.status === 'PLANNED' && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'start')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Başlat"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {workOrder.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'complete')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Tamamla"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(workOrder.status === 'PLANNED' || workOrder.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'cancel')}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="İptal Et"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <Link
                          to={`/work-orders/${workOrder.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(workOrder.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;