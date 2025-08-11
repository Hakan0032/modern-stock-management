import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import { materials, workOrders, materialMovements, machines } from '../data/mockData.ts';
import { DashboardStats, CriticalStockAlert, RecentMovement, UpcomingWorkOrder, StockMovementTrend, WorkOrderCompletionTrend, TopConsumedMaterial } from '../../shared/types.ts';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Calculate material statistics
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => 
      m.currentStock <= m.minStockLevel
    ).length;
    const outOfStockMaterials = materials.filter(m => 
      m.currentStock === 0
    ).length;
    const totalStockValue = materials.reduce((sum, m) => 
      sum + (m.currentStock * m.unitPrice), 0
    );

    // Calculate work order statistics
    const totalWorkOrders = workOrders.length;
    const pendingWorkOrders = workOrders.filter(wo => 
      wo.status === 'PLANNED'
    ).length;
    const inProgressWorkOrders = workOrders.filter(wo => 
      wo.status === 'IN_PROGRESS'
    ).length;
    const completedWorkOrders = workOrders.filter(wo => 
      wo.status === 'COMPLETED'
    ).length;
    const overdueWorkOrders = workOrders.filter(wo => {
      if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') return false;
      if (!wo.plannedEndDate) return false;
      return new Date(wo.plannedEndDate) < new Date();
    }).length;

    // Calculate machine statistics
    const totalMachines = machines.length;
    const activeMachines = machines.filter(m => 
      m.status === 'active'
    ).length;
    const maintenanceMachines = machines.filter(m => 
      m.status === 'maintenance'
    ).length;
    const inactiveMachines = machines.filter(m => 
      m.status === 'inactive'
    ).length;

    // Calculate movement statistics for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthMovements = materialMovements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate.getMonth() === currentMonth && 
             movementDate.getFullYear() === currentYear;
    });
    
    const monthlyInbound = currentMonthMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.totalPrice, 0);
    
    const monthlyOutbound = currentMonthMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.totalPrice, 0);

    const stats: DashboardStats = {
      materials: {
        total: totalMaterials,
        lowStock: lowStockMaterials,
        outOfStock: outOfStockMaterials,
        totalValue: totalStockValue
      },
      workOrders: {
        total: totalWorkOrders,
        pending: pendingWorkOrders,
        inProgress: inProgressWorkOrders,
        completed: completedWorkOrders,
        overdue: overdueWorkOrders
      },
      machines: {
        total: totalMachines,
        active: activeMachines,
        maintenance: maintenanceMachines,
        inactive: inactiveMachines
      },
      movements: {
        monthlyInbound,
        monthlyOutbound,
        monthlyNet: monthlyInbound - monthlyOutbound,
        totalMovements: currentMonthMovements.length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenirken hata oluştu'
    });
  }
});

// Get critical stock alerts
router.get('/alerts/critical-stock', authenticateToken, async (req: Request, res: Response) => {
  try {
    const criticalMaterials: CriticalStockAlert[] = materials
      .filter(m => m.currentStock <= m.minStockLevel)
      .map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        currentStock: m.currentStock,
        minStockLevel: m.minStockLevel,
        unit: m.unit,
        category: m.category,
        location: m.location,
        severity: m.currentStock === 0 ? 'critical' as const : 
                 m.currentStock <= m.minStockLevel * 0.5 ? 'high' as const : 'medium' as const
      }))
      .sort((a, b) => {
        // Sort by severity: critical > high > medium
        const severityOrder = { critical: 3, high: 2, medium: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

    res.json({
      success: true,
      data: criticalMaterials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kritik stok uyarıları yüklenirken hata oluştu'
    });
  }
});

// Get recent movements
router.get('/recent-movements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    
    const recentMovements: RecentMovement[] = materialMovements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, parseInt(limit as string))
      .map(m => ({
        id: m.id,
        materialCode: m.materialCode,
        materialName: m.materialName,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        totalPrice: m.totalPrice,
        reason: m.reason,
        location: m.location,
        createdAt: m.createdAt
      }));

    res.json({
      success: true,
      data: recentMovements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Son hareketler yüklenirken hata oluştu'
    });
  }
});

// Get upcoming work orders
router.get('/upcoming-workorders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingWorkOrders: UpcomingWorkOrder[] = workOrders
      .filter(wo => {
        if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') return false;
        if (!wo.plannedStartDate) return false;
        const startDate = new Date(wo.plannedStartDate);
        return startDate >= now && startDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.plannedStartDate!).getTime() - new Date(b.plannedStartDate!).getTime())
      .slice(0, parseInt(limit as string))
      .map(wo => ({
        id: wo.id,
        orderNumber: wo.orderNumber,
        title: wo.title,
        machineName: wo.machineName,
        status: wo.status,
        priority: wo.priority,
        plannedStartDate: wo.plannedStartDate,
        plannedEndDate: wo.plannedEndDate
      }));

    res.json({
      success: true,
      data: upcomingWorkOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Yaklaşan iş emirleri yüklenirken hata oluştu'
    });
  }
});

// Get stock movement trends (last 6 months)
router.get('/trends/stock-movements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthlyData: StockMovementTrend[] = [];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthMovements = materialMovements.filter(m => {
        const movementDate = new Date(m.createdAt);
        return movementDate >= monthDate && movementDate < nextMonthDate;
      });
      
      const inbound = monthMovements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => sum + m.totalPrice, 0);
      
      const outbound = monthMovements
        .filter(m => m.type === 'OUT')
        .reduce((sum, m) => sum + m.totalPrice, 0);
      
      monthlyData.unshift({
        month: monthDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
        inbound,
        outbound,
        net: inbound - outbound
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stok hareket trendleri yüklenirken hata oluştu'
    });
  }
});

// Get work order completion trends (last 6 months)
router.get('/trends/workorder-completion', authenticateToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthlyData: WorkOrderCompletionTrend[] = [];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthWorkOrders = workOrders.filter(wo => {
        if (!wo.actualEndDate) return false;
        const completionDate = new Date(wo.actualEndDate);
        return completionDate >= monthDate && completionDate < nextMonthDate;
      });
      
      const completed = monthWorkOrders.filter(wo => wo.status === 'COMPLETED').length;
      const cancelled = monthWorkOrders.filter(wo => wo.status === 'CANCELLED').length;
      
      monthlyData.unshift({
        month: monthDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
        completed,
        cancelled,
        total: completed + cancelled
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri tamamlanma trendleri yüklenirken hata oluştu'
    });
  }
});

// Get top consumed materials (current month)
router.get('/top-consumed-materials', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthOutbound = materialMovements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate.getMonth() === currentMonth && 
             movementDate.getFullYear() === currentYear &&
             m.type === 'OUT';
    });
    
    // Group by material and sum quantities
    const materialConsumption: { [key: string]: TopConsumedMaterial } = {};
    currentMonthOutbound.forEach(m => {
      if (!materialConsumption[m.materialId]) {
        materialConsumption[m.materialId] = {
          materialId: m.materialId,
          materialCode: m.materialCode,
          materialName: m.materialName,
          unit: m.unit,
          totalQuantity: 0,
          totalValue: 0,
          movementCount: 0
        };
      }
      materialConsumption[m.materialId].totalQuantity += m.quantity;
      materialConsumption[m.materialId].totalValue += m.totalPrice;
      materialConsumption[m.materialId].movementCount += 1;
    });
    
    const topMaterials = Object.values(materialConsumption)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: topMaterials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'En çok tüketilen malzemeler yüklenirken hata oluştu'
    });
  }
});

// Get category distribution for reports
router.get('/category-distribution', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categoryStats = materials.reduce((acc: any, material) => {
      const category = material.category || 'Diğer';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          count: 0,
          value: 0,
          totalValue: 0
        };
      }
      acc[category].count += 1;
      acc[category].value += material.currentStock * material.unitPrice;
      acc[category].totalValue += material.currentStock * material.unitPrice;
      return acc;
    }, {});

    const categoryArray = Object.values(categoryStats);

    res.json({
      success: true,
      data: categoryArray
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kategori dağılımı yüklenirken hata oluştu'
    });
  }
});

// Get stock trends for reports
router.get('/stock-trends', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const dailyData = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayMovements = materialMovements.filter(m => {
        const movementDate = new Date(m.createdAt);
        return movementDate >= currentDate && movementDate < nextDate;
      });
      
      const stockIn = dayMovements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const stockOut = dayMovements
        .filter(m => m.type === 'OUT')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        stockIn,
        stockOut,
        in: stockIn,
        out: stockOut
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stok trendleri yüklenirken hata oluştu'
    });
  }
});

// Get work order stats for reports
router.get('/work-order-stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const total = workOrders.length;
    const planned = workOrders.filter(wo => wo.status === 'PLANNED').length;
    const inProgress = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    const cancelled = workOrders.filter(wo => wo.status === 'CANCELLED').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const stats = {
      total,
      planned,
      inProgress,
      completed,
      cancelled,
      completionRate
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri istatistikleri yüklenirken hata oluştu'
    });
  }
});

export default router;