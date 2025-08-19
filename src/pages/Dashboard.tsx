import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { api } from '../utils/api';
import { DashboardStats, CriticalStockAlert, RecentMovement } from '../types';
import { formatDate, formatRelativeTime, getStockLevelColor } from '../utils';
import { toast } from 'sonner';
import ErrorBoundary from '../components/ErrorBoundary';
import { safeText, safeNumber, safeArray, validateForReactRender } from '../utils/safeRender';
import { extractSafeMaterials, extractSafeMovements, isApiResponse } from '../utils/typeGuards';

interface StockTrend {
  date: string;
  stockIn: number;
  stockOut: number;
}

interface WorkOrderStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

const DashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    materials: {
      total: 0,
      lowStock: 0,
      outOfStock: 0,

    },
    workOrders: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    },
    machines: {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0
    },
    movements: {
      monthlyInbound: 0,
      monthlyOutbound: 0,
      monthlyNet: 0,
      totalMovements: 0
    }
  });
  const [criticalStock, setCriticalStock] = useState<CriticalStockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all dashboard data in parallel
      const [statsResponse, materialsResponse, movementsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/materials'),
        api.get('/movements')
      ]);
      
      // Process stats with type safety
      if (isApiResponse(statsResponse.data) && statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      // Process materials for critical stock with type safety
      const safeMaterials = extractSafeMaterials(materialsResponse.data);
      const critical = safeMaterials
        .filter(material => 
          safeNumber(material.currentStock) <= safeNumber(material.minStockLevel)
        )
        .map(material => ({
          ...material,
          severity: safeNumber(material.currentStock) === 0 ? 'critical' as const :
                   safeNumber(material.currentStock) <= safeNumber(material.minStockLevel) * 0.5 ? 'critical' as const :
                   'high' as const,
          location: material.location || 'Bilinmeyen'
        }));
      setCriticalStock(critical);
      
      // Process recent movements with type safety
      const safeMovements = extractSafeMovements(movementsResponse.data);
      const recent = safeMovements
        .sort((a: any, b: any) => {
          const dateA = new Date(safeText(a?.createdAt)).getTime();
          const dateB = new Date(safeText(b?.createdAt)).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentMovements(recent);
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error instanceof Error ? error.message : 'Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Bir hata oluştu</h2>
          <p className="text-slate-600 mb-4">{typeof error === 'string' ? error : 'Bilinmeyen bir hata oluştu'}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -m-6 p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sistem genel durumu ve önemli bilgiler
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Toplam Malzeme</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{safeNumber(stats?.materials?.total)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Kritik Stok</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{safeNumber(stats?.materials?.lowStock)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Aktif İş Emirleri</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.total)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20">
          <div className="p-6 border-b border-white/20 dark:border-slate-700/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Kritik Stok Durumu
            </h2>
          </div>
          <div className="p-6">
            {(!criticalStock || criticalStock.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Kritik stok bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeArray(criticalStock)
                  .filter((item: any) => item && typeof item === 'object' && item.id)
                  .slice(0, 5)
                  .map((item: any) => {
                    const safeItem = {
                      id: safeText(item?.id) || 'item-unknown',
                      name: safeText(item?.name) || 'Unknown Material',
                      code: safeText(item?.code) || 'N/A',
                      currentStock: safeNumber(item?.currentStock),
                      minStockLevel: safeNumber(item?.minStockLevel),
                      unit: safeText(item?.unit) || 'unit'
                    };
                    
                    return (
                      <div key={safeItem.id} className="group bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm p-4 rounded-xl border border-red-200/50 dark:border-red-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStockLevelColor(safeItem.currentStock, safeItem.minStockLevel)} shadow-sm`}></div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">{safeText(safeItem.name)}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{safeText(safeItem.code)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              {safeNumber(safeItem.currentStock)} {safeText(safeItem.unit)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Min: {safeNumber(safeItem.minStockLevel)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {(criticalStock && Array.isArray(criticalStock) ? criticalStock : []).length > 5 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
                    +{(criticalStock && Array.isArray(criticalStock) ? criticalStock : []).length - 5} daha fazla
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20">
          <div className="p-6 border-b border-white/20 dark:border-slate-700/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Son Hareketler
            </h2>
          </div>
          <div className="p-6">
            {(!recentMovements || recentMovements.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz hareket bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeArray(recentMovements)
                  .filter((movement: any) => movement && typeof movement === 'object' && movement.id)
                  .slice(0, 5)
                  .map((movement: any) => {
                    const safeMovement = {
                      id: safeText(movement?.id) || 'movement-unknown',
                      materialName: safeText(movement?.materialName) || 'Unknown Material',
                      materialCode: safeText(movement?.materialCode) || 'N/A',
                      type: safeText(movement?.type) || 'OUT',
                      quantity: safeNumber(movement?.quantity),
                      createdAt: safeText(movement?.createdAt) || new Date().toISOString()
                    };
                    
                    return (
                      <div key={safeMovement.id} className="group bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/20 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full shadow-sm ${
                              safeMovement.type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{safeText(safeMovement.materialName)}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{safeText(safeMovement.materialCode)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${
                              safeMovement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {safeMovement.type === 'IN' ? '+' : '-'}{safeNumber(safeMovement.quantity)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatRelativeTime(safeText(safeMovement.createdAt))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Order Stats */}
      {stats?.workOrders && (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20">
          <div className="p-6 border-b border-white/20 dark:border-slate-700/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              İş Emri İstatistikleri
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center group">
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.total)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Toplam</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.pending)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Planlanan</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.inProgress)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Devam Eden</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.completed)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tamamlanan</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{safeNumber(stats?.workOrders?.overdue)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Geciken</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 dark:border-slate-700/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tamamlanma Oranı</span>
                <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {stats?.workOrders?.completed && stats?.workOrders?.total ? ((stats.workOrders.completed / stats.workOrders.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${stats?.workOrders?.completed && stats?.workOrders?.total ? ((stats.workOrders.completed / stats.workOrders.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
};

export default Dashboard;