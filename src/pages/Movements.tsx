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
  Package,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { MaterialMovement } from '../types';
import { formatDate, formatRelativeTime } from '../utils';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { extractSafeMovements, isMaterialMovementArray } from '../utils/typeGuards';
import { safeText, safeNumber, safeArray } from '../utils/safeRender';

const Movements: React.FC = () => {
  const [movements, setMovements] = useState<MaterialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch movements from API
  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/movements');
      
      // Use type-safe extraction
      const safeMovements = extractSafeMovements(response.data);
      
      if (safeMovements.length === 0 && response.data.success) {
        console.warn('No valid movements found in response');
      }
      
      setMovements(safeMovements);
    } catch (error) {
      console.error('Movements fetch error:', error);
      setError(error instanceof Error ? error.message : 'Hareketler yüklenirken hata oluştu');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Filter movements locally after fetching with safe data access
  const filteredMovements = safeArray(movements).filter((movement: any) => {
    let matches = true;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matches = matches && (
        safeText(movement?.materialCode).toLowerCase().includes(searchLower) ||
        safeText(movement?.materialName).toLowerCase().includes(searchLower) ||
        safeText(movement?.reason).toLowerCase().includes(searchLower)
      );
    }
    
    if (typeFilter) {
      matches = matches && safeText(movement?.type) === typeFilter;
    }
    
    if (dateFilter) {
      const movementDate = safeText(movement?.createdAt);
      if (movementDate) {
        matches = matches && new Date(movementDate).toDateString() === new Date(dateFilter).toDateString();
      }
    }
    
    return matches;
  });

  const handleDelete = async (id: string) => {
    console.log('Deleting movement with ID:', id);
    
    if (!confirm('Bu hareketi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/movements/${id}`);
      setMovements(movements.filter(movement => movement.id !== id));
      toast.success('Hareket başarıyla silindi');
      // Refresh the list
      fetchMovements();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Hareket silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Hareketler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Hareketleri</h1>
          <p className="text-gray-600 dark:text-gray-300">Tüm stok giriş ve çıkış hareketlerini görüntüleyin</p>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bugünkü Girişler</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredMovements.filter((m: any) => 
                  safeText(m?.type) === 'IN' && 
                  new Date(safeText(m?.createdAt)).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Bugünkü Çıkışlar</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredMovements.filter((m: any) => 
                  safeText(m?.type) === 'OUT' && 
                  new Date(safeText(m?.createdAt)).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Hareket</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredMovements.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hareket Geçmişi</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMovements.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Henüz hareket bulunmuyor</p>
            </div>
          ) : (
            filteredMovements.map((movement: any) => (
              <div key={movement.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Malzeme #{safeText(movement?.materialId)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          safeText(movement?.type) === 'IN' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {safeText(movement?.type) === 'IN' ? 'Giriş' : 'Çıkış'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{safeText(movement?.performedBy)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(safeText(movement?.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        safeText(movement?.type) === 'IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {safeText(movement?.type) === 'IN' ? '+' : '-'}{safeNumber(movement?.quantity)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(safeText(movement?.createdAt))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(safeText(movement?.id))}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                {safeText(movement?.reason) && (
                  <div className="mt-2 ml-14">
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {safeText(movement?.reason)}
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