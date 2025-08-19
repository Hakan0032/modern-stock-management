import express, { Request, Response } from 'express';
import { authenticateToken, requireManagerAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase';
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
    
    // Build query with filters
    let query = supabaseAdmin.from('materials').select('*');
    
    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }
    
    if (location && typeof location === 'string') {
      query = query.eq('location', location);
    }
    
    if (stockStatus && typeof stockStatus === 'string') {
      switch (stockStatus) {
        case 'low':
          query = query.lte('current_stock', 10);
          query = query.gt('current_stock', 0);
          break;
        case 'out':
          query = query.eq('current_stock', 0);
          break;
        case 'normal':
          query = query.gt('current_stock', 0);
          break;
      }
    }
    
    const { data: materials, error } = await query;
    
    if (error) {
      console.error('Materials fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
      throw error;
    }
    
    const filteredMaterials = materials || [];
    
    // Calculate totals

    const totalItems = filteredMaterials.length;
    const lowStockItems = filteredMaterials.filter(m => 
      m.current_stock <= m.min_stock_level
    ).length;
    const outOfStockItems = filteredMaterials.filter(m => 
      m.current_stock === 0
    ).length;

    const reportData: StockReport = {
      summary: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        generatedAt: new Date().toISOString()
      },
      materials: filteredMaterials.map(m => ({
        code: m.code,
        name: m.name,
        category: m.category,
        location: m.location,
        currentStock: m.current_stock,
        minStockLevel: m.min_stock_level,
        maxStockLevel: m.max_stock_level,
        unit: m.unit,

        stockStatus: m.current_stock === 0 ? 'Stokta Yok' :
                    m.current_stock <= m.min_stock_level ? 'Düşük Stok' : 'Normal',
        lastUpdated: m.updated_at
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
    
    // Build query with filters
    let query = supabaseAdmin.from('material_movements')
      .select(`
        *,
        materials!inner(code, name)
      `)
      .order('created_at', { ascending: false });
    
    // Apply date filter
    if (startDate && typeof startDate === 'string') {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate && typeof endDate === 'string') {
      query = query.lte('created_at', endDate);
    }

    // Apply other filters
    if (materialId && typeof materialId === 'string') {
      query = query.eq('material_id', materialId);
    }

    if (type && typeof type === 'string') {
      query = query.eq('type', type);
    }

    if (location && typeof location === 'string') {
      query = query.eq('location', location);
    }
    
    const { data: movements, error } = await query;
    
    if (error) {
      console.error('Movements fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
      throw error;
    }
    
    const filteredMovements = movements || [];

    // Calculate totals
    const totalInbound = filteredMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOutbound = filteredMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

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
        materialCode: m.materials?.code || '',
        materialName: m.materials?.name || '',
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,

        reason: m.reason,
        reference: m.reference,
        location: m.location,
        performedBy: m.performed_by,
        createdAt: m.created_at
      }))
    };

    if (format === 'csv') {
      const csvData = generateCSV(reportData.movements, [
        { key: 'materialCode', header: 'Malzeme Kodu' },
        { key: 'materialName', header: 'Malzeme Adı' },
        { key: 'type', header: 'Tip' },
        { key: 'quantity', header: 'Miktar' },
        { key: 'unit', header: 'Birim' },

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
    
    // Build query with filters
    let query = supabaseAdmin.from('work_orders')
      .select(`
        *,
        machines!inner(code, name)
      `)
      .order('created_at', { ascending: false });
    
    // Apply date filter
    if (startDate && typeof startDate === 'string') {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate && typeof endDate === 'string') {
      query = query.lte('created_at', endDate);
    }

    // Apply other filters
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (priority && typeof priority === 'string') {
      query = query.eq('priority', priority);
    }

    if (machineId && typeof machineId === 'string') {
      query = query.eq('machine_id', machineId);
    }
    
    const { data: workOrders, error } = await query;
    
    if (error) {
      console.error('Work orders fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
      throw error;
    }
    
    const filteredWorkOrders = workOrders || [];

    // Calculate statistics
    const totalWorkOrders = filteredWorkOrders.length;
    const completedWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'COMPLETED').length;
    const pendingWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'PENDING').length;
    const inProgressWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
    const cancelledWorkOrders = filteredWorkOrders.filter(wo => wo.status === 'CANCELLED').length;
    
    const completionRate = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;
    
    // Calculate average completion time for completed work orders
    const completedOrders = filteredWorkOrders.filter(wo => wo.status === 'COMPLETED' && wo.completed_at);
    const avgCompletionTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, wo) => {
          const start = new Date(wo.created_at).getTime();
          const end = new Date(wo.completed_at!).getTime();
          return sum + (end - start);
        }, 0) / completedOrders.length / (1000 * 60 * 60) // Convert to hours
      : 0;

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
        id: wo.id,
        orderNumber: wo.order_number,
        title: wo.title,
        description: wo.description,
        machineCode: wo.machines?.code || '',
        machineName: wo.machines?.name || '',
        status: wo.status,
        priority: wo.priority,
        assignedTo: wo.assigned_to,
        plannedStartDate: wo.planned_start_date,
        plannedEndDate: wo.planned_end_date,
        actualStartDate: wo.actual_start_date,
        actualEndDate: wo.actual_end_date,
        estimatedDuration: wo.estimated_duration,
        actualDuration: wo.actual_duration,
        createdAt: wo.created_at,
        startedAt: wo.started_at,
        completedAt: wo.completed_at,
        notes: wo.notes
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
    const { 
      startDate, 
      endDate, 
      machineId,
      format = 'json' 
    } = req.query;
    
    // Build work orders query with filters
    let workOrdersQuery = supabaseAdmin.from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply date filter
    if (startDate && typeof startDate === 'string') {
      workOrdersQuery = workOrdersQuery.gte('created_at', startDate);
    }
    
    if (endDate && typeof endDate === 'string') {
      workOrdersQuery = workOrdersQuery.lte('created_at', endDate);
    }

    if (machineId && typeof machineId === 'string') {
      workOrdersQuery = workOrdersQuery.eq('machine_id', machineId);
    }
    
    // Get machines and work orders
    const [{ data: workOrders, error: workOrdersError }, { data: machines, error: machinesError }] = await Promise.all([
      workOrdersQuery,
      supabaseAdmin.from('machines').select('*')
    ]);
    
    if (workOrdersError) {
      console.error('Work orders fetch error:', workOrdersError instanceof Error ? workOrdersError.message : JSON.stringify(workOrdersError));
      throw workOrdersError;
    }
    
    if (machinesError) {
      console.error('Machines fetch error:', machinesError instanceof Error ? machinesError.message : JSON.stringify(machinesError));
      throw machinesError;
    }
    
    const filteredWorkOrders = workOrders || [];
    const allMachines = machines || [];

    // Group work orders by machine
    const machineUtilization = allMachines.map(machine => {
      const machineWorkOrders = filteredWorkOrders.filter(wo => wo.machine_id === machine.id);
      
      const totalWorkOrders = machineWorkOrders.length;
      const completedWorkOrders = machineWorkOrders.filter(wo => wo.status === 'COMPLETED').length;
      const inProgressWorkOrders = machineWorkOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
      const pendingWorkOrders = machineWorkOrders.filter(wo => wo.status === 'PENDING').length;
      
      const totalPlannedHours = machineWorkOrders.reduce((sum, wo) => sum + (wo.estimated_duration || 0), 0);
      const totalActualHours = machineWorkOrders
        .filter(wo => wo.actual_duration)
        .reduce((sum, wo) => sum + (wo.actual_duration || 0), 0);
      
      const utilizationRate = totalPlannedHours > 0 ? (totalActualHours / totalPlannedHours) * 100 : 0;
      
      // Calculate average completion time for completed work orders
      const completedOrdersWithDuration = machineWorkOrders.filter(wo => wo.status === 'COMPLETED' && wo.actual_duration);
      const avgCompletionTime = completedOrdersWithDuration.length > 0 ? 
        completedOrdersWithDuration.reduce((sum, wo) => sum + (wo.actual_duration || 0), 0) / completedOrdersWithDuration.length : 0;
      
      return {
        machineId: machine.id,
        machineCode: machine.code,
        machineName: machine.name,
        category: machine.category,
        status: machine.status,
        totalWorkOrders,
        completedWorkOrders,
        inProgressWorkOrders,
        pendingWorkOrders,
        totalPlannedHours,
        totalActualHours,
        totalHours: totalActualHours,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        efficiency: completedWorkOrders > 0 ? Math.round((completedWorkOrders / totalWorkOrders) * 100) : 0
      };
    });

    // Sort by utilization rate (highest first)
    machineUtilization.sort((a, b) => b.utilizationRate - a.utilizationRate);

    const reportData: MachineUtilizationReport = {
      summary: {
        totalMachines: allMachines.length,
        activeMachines: allMachines.filter(m => m.status === 'active').length,
        totalWorkOrders: filteredWorkOrders.length,
        completedWorkOrders: filteredWorkOrders.filter(wo => wo.status === 'COMPLETED').length,
        

        period: {
          startDate: (startDate as string) || 'Başlangıç yok',
          endDate: (endDate as string) || 'Bitiş yok'
        },
        generatedAt: new Date().toISOString()
      },
      machines: machineUtilization
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
    
    // Build machines query
    let machinesQuery = supabaseAdmin.from('machines').select('*');
    
    if (machineId && typeof machineId === 'string') {
      machinesQuery = machinesQuery.eq('id', machineId);
    }
    
    // Get machines and BOM items
    const [{ data: machines, error: machinesError }, { data: bomItems, error: bomError }] = await Promise.all([
      machinesQuery,
      supabaseAdmin.from('bom_items')
        .select(`
          *,
          materials!inner(code, name)
        `)
    ]);
    
    if (machinesError) {
      console.error('Machines fetch error:', machinesError instanceof Error ? machinesError.message : JSON.stringify(machinesError));
      throw machinesError;
    }
    
    if (bomError) {
      console.error('BOM items fetch error:', bomError instanceof Error ? bomError.message : JSON.stringify(bomError));
      throw bomError;
    }
    
    const filteredMachines = machines || [];
    const allBomItems = bomItems || [];

    const bomAnalysis = filteredMachines.map(machine => {
      const machineBOM = allBomItems.filter(item => item.machine_id === machine.id);
      
      const totalCost = 0;
      
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
          materialCode: item.materials?.code || '',
          materialName: item.materials?.name || '',
          quantity: item.quantity,
          unit: item.unit,
          totalCost: 0
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