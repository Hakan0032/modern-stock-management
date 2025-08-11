import express, { Request, Response } from 'express';
import { authenticateToken, requireManagerAccess } from '../middleware/auth';
import { materials, workOrders, materialMovements, machines, bomItems } from '../data/mockData';
import { Material, WorkOrder, MaterialMovement, Machine, BOMItem, StockReport, MovementReport, WorkOrderReport, MachineUtilizationReport, BOMCostAnalysisReport } from '../../shared/types';

const router = express.Router();

interface CSVColumn {
  key: string;
  header: string;
}

// Get stock report
router.get('/stock', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { category, location, stockStatus, format = 'json' } = req.query;
    let filteredMaterials = [...materials];

    // Apply filters
    if (category && typeof category === 'string') {
      filteredMaterials = filteredMaterials.filter(m => m.category === category);
    }

    if (location && typeof location === 'string') {
      filteredMaterials = filteredMaterials.filter(m => m.location === location);
    }

    if (stockStatus && typeof stockStatus === 'string') {
      switch (stockStatus) {
        case 'low':
          filteredMaterials = filteredMaterials.filter(m => 
            m.currentStock <= m.minStockLevel && m.currentStock > 0
          );
          break;
        case 'out':
          filteredMaterials = filteredMaterials.filter(m => m.currentStock === 0);
          break;
        case 'normal':
          filteredMaterials = filteredMaterials.filter(m => 
            m.currentStock > m.minStockLevel
          );
          break;
      }
    }

    // Calculate totals
    const totalValue = filteredMaterials.reduce((sum, m) => 
      sum + (m.currentStock * m.unitPrice), 0
    );
    const totalItems = filteredMaterials.length;
    const lowStockItems = filteredMaterials.filter(m => 
      m.currentStock <= m.minStockLevel
    ).length;
    const outOfStockItems = filteredMaterials.filter(m => 
      m.currentStock === 0
    ).length;

    const reportData: StockReport = {
      summary: {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        generatedAt: new Date().toISOString()
      },
      materials: filteredMaterials.map(m => ({
        code: m.code,
        name: m.name,
        category: m.category,
        location: m.location,
        currentStock: m.currentStock,
        minStockLevel: m.minStockLevel,
        maxStockLevel: m.maxStockLevel,
        unit: m.unit,
        unitPrice: m.unitPrice,
        totalValue: m.currentStock * m.unitPrice,
        stockStatus: m.currentStock === 0 ? 'Stokta Yok' :
                    m.currentStock <= m.minStockLevel ? 'Düşük Stok' : 'Normal',
        lastUpdated: m.updatedAt
      }))
    };

    if (format === 'csv') {
      const csvData = generateCSV(reportData.materials, [
        { key: 'code', header: 'Kod' },
        { key: 'name', header: 'Ad' },
        { key: 'category', header: 'Kategori' },
        { key: 'location', header: 'Lokasyon' },
        { key: 'currentStock', header: 'Mevcut Stok' },
        { key: 'minStockLevel', header: 'Min Stok' },
        { key: 'unit', header: 'Birim' },
        { key: 'unitPrice', header: 'Birim Fiyat' },
        { key: 'totalValue', header: 'Toplam Değer' },
        { key: 'stockStatus', header: 'Stok Durumu' }
      ]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stok-raporu.csv');
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stok raporu oluşturulurken hata oluştu'
    });
  }
});

// Get movement report
router.get('/movements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      materialId, 
      type, 
      location,
      format = 'json' 
    } = req.query;
    
    let filteredMovements = [...materialMovements];

    // Apply date filter
    if (startDate && typeof startDate === 'string') {
      filteredMovements = filteredMovements.filter(m => 
        new Date(m.createdAt) >= new Date(startDate)
      );
    }
    
    if (endDate && typeof endDate === 'string') {
      filteredMovements = filteredMovements.filter(m => 
        new Date(m.createdAt) <= new Date(endDate)
      );
    }

    // Apply other filters
    if (materialId && typeof materialId === 'string') {
      filteredMovements = filteredMovements.filter(m => m.materialId === materialId);
    }

    if (type && typeof type === 'string') {
      filteredMovements = filteredMovements.filter(m => m.type === type);
    }

    if (location && typeof location === 'string') {
      filteredMovements = filteredMovements.filter(m => m.location === location);
    }

    // Sort by date (newest first)
    filteredMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate totals
    const totalInbound = filteredMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.totalPrice, 0);
    
    const totalOutbound = filteredMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.totalPrice, 0);

    const reportData: MovementReport = {
      summary: {
        totalMovements: filteredMovements.length,
        totalInbound,
        totalOutbound,
        netMovement: totalInbound - totalOutbound,
        period: {
          startDate: (startDate as string) || 'Başlangıç yok',
          endDate: (endDate as string) || 'Bitiş yok'
        },
        generatedAt: new Date().toISOString()
      },
      movements: filteredMovements.map(m => ({
        id: m.id,
        materialCode: m.materialCode,
        materialName: m.materialName,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        unitPrice: m.unitPrice,
        totalPrice: m.totalPrice,
        reason: m.reason,
        reference: m.reference,
        location: m.location,
        performedBy: m.performedBy,
        createdAt: m.createdAt
      }))
    };

    if (format === 'csv') {
      const csvData = generateCSV(reportData.movements, [
        { key: 'materialCode', header: 'Malzeme Kodu' },
        { key: 'materialName', header: 'Malzeme Adı' },
        { key: 'type', header: 'Tip' },
        { key: 'quantity', header: 'Miktar' },
        { key: 'unit', header: 'Birim' },
        { key: 'unitPrice', header: 'Birim Fiyat' },
        { key: 'totalPrice', header: 'Toplam Fiyat' },
        { key: 'reason', header: 'Sebep' },
        { key: 'location', header: 'Lokasyon' },
        { key: 'createdAt', header: 'Tarih' }
      ]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=hareket-raporu.csv');
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hareket raporu oluşturulurken hata oluştu'
    });
  }
});

// Get work order report
router.get('/workorders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      priority, 
      machineId,
      format = 'json' 
    } = req.query;
    
    let filteredWorkOrders = [...workOrders];

    // Apply date filter (based on creation date)
    if (startDate && typeof startDate === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        new Date(wo.createdAt) >= new Date(startDate)
      );
    }
    
    if (endDate && typeof endDate === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        new Date(wo.createdAt) <= new Date(endDate)
      );
    }

    // Apply other filters
    if (status && typeof status === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => wo.status === status);
    }

    if (priority && typeof priority === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => wo.priority === priority);
    }

    if (machineId && typeof machineId === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => wo.machineId === machineId);
    }

    // Sort by creation date (newest first)
    filteredWorkOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate statistics
    const totalWorkOrders = filteredWorkOrders.length;
    const completedWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'COMPLETED').length;
    const pendingWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'PLANNED').length;
    const inProgressWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
    const cancelledWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'CANCELLED').length;
    
    const completionRate = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders * 100) : 0;
    
    // Calculate average completion time for completed work orders
    const completedWithDuration = filteredWorkOrders.filter(wo => 
      wo.status === 'COMPLETED' && wo.actualDuration
    );
    const avgCompletionTime = completedWithDuration.length > 0 ?
      (completedWithDuration.reduce((sum, wo) => sum + (wo.actualDuration || 0), 0) / completedWithDuration.length) :
      0;

    const reportData: WorkOrderReport = {
      summary: {
        totalWorkOrders,
        completedWorkOrders,
        pendingWorkOrders,
        inProgressWorkOrders,
        cancelledWorkOrders,
        completionRate: parseFloat(completionRate.toFixed(2)),
        avgCompletionTime: parseFloat(avgCompletionTime.toFixed(2)),
        period: {
          startDate: (startDate as string) || 'Başlangıç yok',
          endDate: (endDate as string) || 'Bitiş yok'
        },
        generatedAt: new Date().toISOString()
      },
      workOrders: filteredWorkOrders.map(wo => ({
        orderNumber: wo.orderNumber,
        title: wo.title,
        machineName: wo.machineName,
        status: wo.status,
        priority: wo.priority,
        plannedStartDate: wo.plannedStartDate,
        plannedEndDate: wo.plannedEndDate,
        actualStartDate: wo.actualStartDate,
        actualEndDate: wo.actualEndDate,
        estimatedDuration: wo.estimatedDuration,
        actualDuration: wo.actualDuration,
        createdAt: wo.createdAt
      }))
    };

    if (format === 'csv') {
      const csvData = generateCSV(reportData.workOrders, [
        { key: 'orderNumber', header: 'İş Emri No' },
        { key: 'title', header: 'Başlık' },
        { key: 'machineName', header: 'Makine' },
        { key: 'status', header: 'Durum' },
        { key: 'priority', header: 'Öncelik' },
        { key: 'plannedStartDate', header: 'Planlanan Başlangıç' },
        { key: 'plannedEndDate', header: 'Planlanan Bitiş' },
        { key: 'actualStartDate', header: 'Gerçek Başlangıç' },
        { key: 'actualEndDate', header: 'Gerçek Bitiş' },
        { key: 'actualDuration', header: 'Gerçek Süre (saat)' },
        { key: 'createdAt', header: 'Oluşturulma Tarihi' }
      ]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=is-emri-raporu.csv');
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri raporu oluşturulurken hata oluştu'
    });
  }
});

// Get machine utilization report
router.get('/machine-utilization', authenticateToken, requireManagerAccess, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    let filteredWorkOrders = [...workOrders];

    // Apply date filter
    if (startDate && typeof startDate === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        !wo.actualStartDate || new Date(wo.actualStartDate) >= new Date(startDate)
      );
    }
    
    if (endDate && typeof endDate === 'string') {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        !wo.actualEndDate || new Date(wo.actualEndDate) <= new Date(endDate)
      );
    }

    // Group work orders by machine
    const machineUtilization: { [key: string]: any } = {};
    
    machines.forEach(machine => {
      machineUtilization[machine.id] = {
        machineId: machine.id,
        machineName: machine.name,
        machineCode: machine.code,
        category: machine.category,
        status: machine.status,
        totalWorkOrders: 0,
        completedWorkOrders: 0,
        totalHours: 0,
        avgCompletionTime: 0,
        utilizationRate: 0
      };
    });

    filteredWorkOrders.forEach(wo => {
      if (machineUtilization[wo.machineId]) {
        machineUtilization[wo.machineId].totalWorkOrders++;
        
        if (wo.status === 'COMPLETED') {
          machineUtilization[wo.machineId].completedWorkOrders++;
          
          if (wo.actualDuration) {
            machineUtilization[wo.machineId].totalHours += wo.actualDuration;
          }
        }
      }
    });

    // Calculate averages and utilization rates
    Object.values(machineUtilization).forEach((machine: any) => {
      if (machine.completedWorkOrders > 0) {
        machine.avgCompletionTime = parseFloat((machine.totalHours / machine.completedWorkOrders).toFixed(2));
        machine.utilizationRate = parseFloat(((machine.completedWorkOrders / machine.totalWorkOrders) * 100).toFixed(2));
      }
    });

    const reportData: MachineUtilizationReport = {
      summary: {
        totalMachines: machines.length,
        activeMachines: machines.filter(m => m.status === 'active').length,
        totalWorkOrders: filteredWorkOrders.length,
        completedWorkOrders: filteredWorkOrders.filter(wo => wo.status === 'COMPLETED').length,
        period: {
          startDate: (startDate as string) || 'Başlangıç yok',
          endDate: (endDate as string) || 'Bitiş yok'
        },
        generatedAt: new Date().toISOString()
      },
      machines: Object.values(machineUtilization)
    };

    if (format === 'csv') {
      const csvData = generateCSV(reportData.machines, [
        { key: 'machineCode', header: 'Makine Kodu' },
        { key: 'machineName', header: 'Makine Adı' },
        { key: 'category', header: 'Kategori' },
        { key: 'status', header: 'Durum' },
        { key: 'totalWorkOrders', header: 'Toplam İş Emri' },
        { key: 'completedWorkOrders', header: 'Tamamlanan İş Emri' },
        { key: 'totalHours', header: 'Toplam Saat' },
        { key: 'avgCompletionTime', header: 'Ort. Tamamlanma Süresi' },
        { key: 'utilizationRate', header: 'Kullanım Oranı (%)' }
      ]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=makine-kullanim-raporu.csv');
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makine kullanım raporu oluşturulurken hata oluştu'
    });
  }
});

// Get BOM cost analysis report
router.get('/bom-cost-analysis', authenticateToken, requireManagerAccess, async (req: Request, res: Response) => {
  try {
    const { machineId, format = 'json' } = req.query;
    
    let filteredMachines = [...machines];
    
    if (machineId && typeof machineId === 'string') {
      filteredMachines = filteredMachines.filter(m => m.id === machineId);
    }

    const bomAnalysis = filteredMachines.map(machine => {
      const machineBOM = bomItems.filter(item => item.machineId === machine.id);
      
      const totalCost = machineBOM.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      const materialCount = machineBOM.length;
      
      return {
        machineId: machine.id,
        machineCode: machine.code,
        machineName: machine.name,
        category: machine.category,
        materialCount,
        totalCost,
        avgMaterialCost: materialCount > 0 ? parseFloat((totalCost / materialCount).toFixed(2)) : 0,
        bomItems: machineBOM.map(item => ({
          materialCode: item.materialCode,
          materialName: item.materialName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalCost: item.quantity * item.unitPrice
        }))
      };
    });

    const reportData: BOMCostAnalysisReport = {
      summary: {
        totalMachines: bomAnalysis.length,
        totalBOMCost: bomAnalysis.reduce((sum, machine) => sum + machine.totalCost, 0),
        avgBOMCost: bomAnalysis.length > 0 ? 
          parseFloat((bomAnalysis.reduce((sum, machine) => sum + machine.totalCost, 0) / bomAnalysis.length).toFixed(2)) : 0,
        generatedAt: new Date().toISOString()
      },
      machines: bomAnalysis
    };

    if (format === 'csv') {
      // Flatten BOM items for CSV export
      const flattenedData: any[] = [];
      bomAnalysis.forEach(machine => {
        machine.bomItems.forEach(item => {
          flattenedData.push({
            machineCode: machine.machineCode,
            machineName: machine.machineName,
            materialCode: item.materialCode,
            materialName: item.materialName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalCost: item.totalCost
          });
        });
      });
      
      const csvData = generateCSV(flattenedData, [
        { key: 'machineCode', header: 'Makine Kodu' },
        { key: 'machineName', header: 'Makine Adı' },
        { key: 'materialCode', header: 'Malzeme Kodu' },
        { key: 'materialName', header: 'Malzeme Adı' },
        { key: 'quantity', header: 'Miktar' },
        { key: 'unit', header: 'Birim' },
        { key: 'unitPrice', header: 'Birim Fiyat' },
        { key: 'totalCost', header: 'Toplam Maliyet' }
      ]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bom-maliyet-analizi.csv');
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOM maliyet analizi raporu oluşturulurken hata oluştu'
    });
  }
});

// Helper function to generate CSV
function generateCSV(data: any[], columns: CSVColumn[]): string {
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

export default router;