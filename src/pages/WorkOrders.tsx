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
import { toast } from 'sonner';

// Mock data for work orders
const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO001',
    orderNumber: 'WO-2024-001',
    title: 'Makine Bakımı - CNC Torna',
    description: 'Aylık rutin bakım işlemleri',
    machineId: 'M001',
    machineName: 'CNC Torna Tezgahı',
    quantity: 100,
    status: 'PLANNED',
    priority: 'HIGH',
    plannedStartDate: '2024-12-30T10:00:00Z',
    assignedTo: 'Ahmet Yılmaz',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z'
  },
  {
    id: 'WO002',
    orderNumber: 'WO-2024-002',
    title: 'Malzeme Transferi',
    description: 'Depo A\'dan Depo B\'ye malzeme transferi',
    machineId: 'M002',
    machineName: 'Konveyör Sistemi',
    quantity: 200,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    plannedStartDate: '2024-12-25T14:00:00Z',
    assignedTo: 'Mehmet Kaya',
    createdAt: '2024-12-22T09:30:00Z',
    updatedAt: '2024-12-25T14:00:00Z'
  },
  {
    id: 'WO003',
    orderNumber: 'WO-2024-003',
    title: 'Kalite Kontrol',
    description: 'Üretilen parçaların kalite kontrolü',
    machineId: 'M003',
    machineName: 'Test Cihazı',
    quantity: 50,
    status: 'COMPLETED',
    priority: 'LOW',
    plannedStartDate: '2024-12-23T16:00:00Z',
    assignedTo: 'Fatma Demir',
    createdAt: '2024-12-21T11:00:00Z',
    updatedAt: '2024-12-23T16:00:00Z'
  }
];

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: '550e8400-e29b-41d4-a716-446655440031',
      orderNumber: 'WO-2024-001',
      title: 'Çelik Plaka İşleme',
      description: 'CNC torna ile çelik plaka işleme operasyonu',
      status: 'PLANNED',
      priority: 'HIGH',
      machineId: 'M001',
      machineName: 'CNC Torna Tezgahı',
      quantity: 50,
      estimatedDuration: 480,
      actualDuration: undefined,
      plannedStartDate: '2024-01-25T08:00:00Z',
      plannedEndDate: '2024-01-25T18:00:00Z',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
      notes: 'Kalite kontrol sonrası paketleme'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440032',
      orderNumber: 'WO-2024-002',
      title: 'Alüminyum Profil Kesim',
      description: 'Freze makinesi ile alüminyum profil kesim işlemi',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      machineId: 'M002',
      machineName: 'Freze Makinesi',
      quantity: 100,
      estimatedDuration: 360,
      actualDuration: 180,
      plannedStartDate: '2024-01-20T08:00:00Z',
      actualStartDate: '2024-01-20T08:00:00Z',
      plannedEndDate: '2024-01-24T17:00:00Z',
      createdAt: '2024-01-19T14:30:00Z',
      updatedAt: '2024-01-20T12:00:00Z',
      notes: 'İlk yarı tamamlandı'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440033',
      orderNumber: 'WO-2024-003',
      title: 'Kaynak İşlemi',
      description: 'Çelik parçaların kaynak ile birleştirilmesi',
      status: 'COMPLETED',
      priority: 'LOW',
      machineId: 'M003',
      machineName: 'Kaynak Makinesi',
      quantity: 25,
      estimatedDuration: 240,
      actualDuration: 220,
      plannedStartDate: '2024-01-18T10:00:00Z',
      actualStartDate: '2024-01-18T10:00:00Z',
      plannedEndDate: '2024-01-18T14:00:00Z',
      actualEndDate: '2024-01-18T13:40:00Z',
      createdAt: '2024-01-17T11:15:00Z',
      updatedAt: '2024-01-18T13:40:00Z',
      notes: 'Kalite kontrol başarılı'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    // Filter mock data based on search and filters
    let filteredWorkOrders = mockWorkOrders;
    
    if (searchTerm) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => wo.status === statusFilter);
    }
    
    if (priorityFilter) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => wo.priority === priorityFilter);
    }
    
    setWorkOrders(filteredWorkOrders);
  }, [searchTerm, statusFilter, priorityFilter]);

  const handleStatusChange = (id: string, action: 'start' | 'complete' | 'cancel') => {
    console.log('WorkOrders - Status change button clicked for ID:', id, 'Action:', action);
    const workOrder = workOrders.find(wo => wo.id === id);
    console.log('WorkOrders - Work order found:', workOrder ? 'Yes' : 'No');
    
    const newStatus = action === 'start' ? 'IN_PROGRESS' : action === 'complete' ? 'COMPLETED' : 'CANCELLED';
    
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: newStatus } : wo
    ));
    
    console.log('WorkOrders - Status changed to:', action);
    toast.success('Başarılı', {
      description: `İş emri ${action === 'start' ? 'başlatıldı' : action === 'complete' ? 'tamamlandı' : 'iptal edildi'}`
    });
  };

  const handleDelete = async (id: string) => {
    console.log('Deleting work order with ID:', id);
    
    if (!confirm('Bu iş emrini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkOrders(prev => prev.filter(wo => wo.id !== id));
        toast.success('İş emri başarıyla silindi');
      } else if (response.status === 404) {
        toast.error('İş emri bulunamadı');
      } else if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.error || 'İş emri silinemez');
      } else if (response.status === 500) {
        toast.error('Sunucu hatası oluştu');
      } else {
        toast.error('İş emri silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Ağ hatası oluştu');
    }
  };

  const handleEdit = (id: string) => {
    const workOrder = workOrders.find(wo => wo.id === id);
    if (workOrder) {
      toast.info('Bilgi', {
        description: `${workOrder.title} iş emri düzenleniyor...`
      });
      // Here you would typically navigate to edit page or open edit modal
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
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">İş emirleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Yükleme Hatası</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İş Emri Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300">Üretim iş emirlerini planlayın ve takip edin</p>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="İş emri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam İş Emri</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(workOrders) ? workOrders.length : 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Planlanan</p>
              <p className="text-2xl font-bold text-blue-600">
                {Array.isArray(workOrders) ? workOrders.filter(wo => wo.status === 'PLANNED').length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Devam Eden</p>
              <p className="text-2xl font-bold text-orange-600">
                {Array.isArray(workOrders) ? workOrders.filter(wo => wo.status === 'IN_PROGRESS').length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tamamlanan</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İş Emri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Makine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Öncelik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Planlanan Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {!Array.isArray(workOrders) || workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Henüz iş emri bulunmuyor</p>
                    </td>
                  </tr>
              ) : (
                workOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {workOrder.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {workOrder.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
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
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {workOrder.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(workOrder.plannedStartDate)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/work-orders/${workOrder.id}`}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded cursor-pointer transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {workOrder.status === 'PLANNED' && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'start')}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded cursor-pointer transition-colors"
                            title="Başlat"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {workOrder.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'complete')}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded cursor-pointer transition-colors"
                            title="Tamamla"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(workOrder.status === 'PLANNED' || workOrder.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleStatusChange(workOrder.id, 'cancel')}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
                            title="İptal Et"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <Link
                          to={`/work-orders/${workOrder.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-1 rounded cursor-pointer transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(workOrder.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
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