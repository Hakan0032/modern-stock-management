import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Package
} from 'lucide-react';
import { MaterialMovement } from '../types';
import { api } from '../utils/api';
import { formatDate, formatRelativeTime } from '../utils';
import { toast } from 'sonner';

const Movements: React.FC = () => {
  const [movements, setMovements] = useState<MaterialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [typeFilter, dateFilter]);

  // Debounce search to prevent focus loss
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchMovements();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      if (dateFilter) params.append('date', dateFilter);
      
      const response = await api.get(`/movements?${params.toString()}`);
      setMovements(response.data.data.data || response.data.data || []);
    } catch (error) {
      toast.error('Hata', {
        description: 'Hareketler yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Stok Hareketleri</h1>
          <p className="text-gray-600">Tüm stok giriş ve çıkış hareketlerini görüntüleyin</p>
        </div>
        <Link
          to="/movements/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Hareket</span>
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
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Hareket Türleri</option>
            <option value="IN">Giriş</option>
            <option value="OUT">Çıkış</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bugünkü Girişler</p>
              <p className="text-2xl font-bold text-green-600">
                {movements.filter(m => 
                  m.type === 'IN' && 
                  new Date(m.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bugünkü Çıkışlar</p>
              <p className="text-2xl font-bold text-red-600">
                {movements.filter(m => 
                  m.type === 'OUT' && 
                  new Date(m.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Hareket</p>
              <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hareket Geçmişi</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {movements.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz hareket bulunmuyor</p>
            </div>
          ) : (
            movements.map((movement) => (
              <div key={movement.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      movement.type === 'IN' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.type === 'IN' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          Malzeme #{movement.materialId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.type === 'IN' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'IN' ? 'Giriş' : 'Çıkış'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{movement.performedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(movement.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(movement.createdAt)}
                    </div>
                  </div>
                </div>
                {movement.reason && (
                  <div className="mt-2 ml-14">
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {movement.reason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Movements;