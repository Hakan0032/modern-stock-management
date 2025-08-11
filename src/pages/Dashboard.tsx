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
import { formatCurrency, formatDate, formatRelativeTime, getStockLevelColor } from '../utils';
import { toast } from 'sonner';

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [criticalStock, setCriticalStock] = useState<CriticalStockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats | null>(null);
  const [stockTrends, setStockTrends] = useState<StockTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch each endpoint individually with better error handling
      const statsRes = await api.get('/dashboard/stats').catch(err => {
        console.warn('Stats API failed:', err instanceof Error ? err.message : String(err));
        return { data: { data: null } };
      });
      
      const criticalRes = await api.get('/dashboard/alerts/critical-stock').catch(err => {
        console.warn('Critical stock API failed:', err instanceof Error ? err.message : String(err));
        return { data: { data: [] } };
      });
      
      const movementsRes = await api.get('/dashboard/recent-movements').catch(err => {
        console.warn('Recent movements API failed:', err instanceof Error ? err.message : String(err));
        return { data: { data: [] } };
      });
      
      const trendsRes = await api.get('/dashboard/trends/stock-movements').catch(err => {
        console.warn('Stock trends API failed:', err instanceof Error ? err.message : String(err));
        return { data: { data: [] } };
      });

      // Set data with fallbacks
      setStats(statsRes.data.data || statsRes.data || {
        materials: { total: 0, totalValue: 0, lowStock: 0, outOfStock: 0 },
        workOrders: { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 },
        machines: { total: 0, active: 0, maintenance: 0, inactive: 0 },
        movements: { monthlyInbound: 0, monthlyOutbound: 0, monthlyNet: 0, totalMovements: 0 }
      });
      
      setCriticalStock(Array.isArray(criticalRes.data.data) ? criticalRes.data.data : 
                      Array.isArray(criticalRes.data) ? criticalRes.data : []);
      
      setRecentMovements(Array.isArray(movementsRes.data.data) ? movementsRes.data.data : 
                        Array.isArray(movementsRes.data) ? movementsRes.data : []);
      
      setStockTrends(Array.isArray(trendsRes.data.data) ? trendsRes.data.data : 
                    Array.isArray(trendsRes.data) ? trendsRes.data : []);
      
      // Calculate work order stats from main stats
      const statsData = statsRes.data.data || statsRes.data;
      if (statsData?.workOrders) {
        const woStats = statsData.workOrders;
        setWorkOrderStats({
          total: woStats.total || 0,
          planned: woStats.pending || 0,
          inProgress: woStats.inProgress || 0,
          completed: woStats.completed || 0,
          cancelled: 0, // Not available in current stats
          completionRate: woStats.total > 0 ? (woStats.completed / woStats.total) * 100 : 0
        });
      }
    } catch (error) {
      console.error('Dashboard API Error:', error instanceof Error ? error.message : String(error));
      // Set default values on complete failure
      setStats({
        materials: { total: 0, totalValue: 0, lowStock: 0, outOfStock: 0 },
        workOrders: { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 },
        machines: { total: 0, active: 0, maintenance: 0, inactive: 0 },
        movements: { monthlyInbound: 0, monthlyOutbound: 0, monthlyNet: 0, totalMovements: 0 }
      });
      setCriticalStock([]);
      setRecentMovements([]);
      setStockTrends([]);
      
      toast.error('Hata', {
        description: 'Dashboard verileri yüklenirken hata oluştu. Varsayılan veriler gösteriliyor.'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 -m-6 p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Toplam Malzeme</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats?.materials.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Toplam Stok Değeri</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{formatCurrency(stats?.materials.totalValue || 0)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Kritik Stok</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{stats?.materials.lowStock || 0}</p>
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
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{stats?.workOrders.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Kritik Stok Durumu
            </h2>
          </div>
          <div className="p-6">
            {criticalStock.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-500 font-medium">Kritik stok bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="group bg-gradient-to-r from-red-50 to-red-100/50 backdrop-blur-sm p-4 rounded-xl border border-red-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStockLevelColor(item.currentStock, item.minStockLevel)} shadow-sm`}></div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-red-700 transition-colors">{item.name}</p>
                          <p className="text-sm text-slate-600 font-medium">{item.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-xs text-slate-500">Min: {item.minStockLevel}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {criticalStock.length > 5 && (
                  <p className="text-sm text-slate-500 text-center font-medium">
                    +{criticalStock.length - 5} daha fazla
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Son Hareketler
            </h2>
          </div>
          <div className="p-6">
            {recentMovements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-500 font-medium">Henüz hareket bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="group bg-gradient-to-r from-slate-50 to-blue-50/30 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full shadow-sm ${
                          movement.type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{movement.materialName}</p>
                          <p className="text-sm text-slate-600 font-medium">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatRelativeTime(movement.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Order Stats */}
      {workOrderStats && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
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
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{workOrderStats.total}</p>
                  <p className="text-sm text-slate-600 font-medium">Toplam</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{workOrderStats.planned}</p>
                  <p className="text-sm text-slate-600 font-medium">Planlanan</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{workOrderStats.inProgress}</p>
                  <p className="text-sm text-slate-600 font-medium">Devam Eden</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{workOrderStats.completed}</p>
                  <p className="text-sm text-slate-600 font-medium">Tamamlanan</p>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-red-100 to-red-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                  <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{workOrderStats.cancelled}</p>
                  <p className="text-sm text-slate-600 font-medium">İptal Edilen</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 font-medium">Tamamlanma Oranı</span>
                <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {workOrderStats.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${workOrderStats.completionRate}%` }}
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

export default Dashboard;