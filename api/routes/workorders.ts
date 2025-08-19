import express, { Request, Response } from 'express';
import { authenticateToken, requirePlanningAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import type { WorkOrder, MaterialMovement } from '../../shared/types';

const router = express.Router();

// Get all work orders with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, priority, machineId, page = 1, limit = 10 } = req.query;
    
    // Get all work orders from Supabase
    let workOrders = await dbAdmin.workOrders.getAll();

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      workOrders = workOrders.filter(wo => 
        wo.order_number.toLowerCase().includes(searchLower) ||
        wo.title.toLowerCase().includes(searchLower) ||
        wo.description?.toLowerCase().includes(searchLower) ||
        wo.machine_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      workOrders = workOrders.filter(wo => 
        wo.status === status
      );
    }

    // Apply priority filter
    if (priority) {
      workOrders = workOrders.filter(wo => 
        wo.priority === priority
      );
    }

    // Apply machine filter
    if (machineId) {
      workOrders = workOrders.filter(wo => 
        wo.machine_id === machineId
      );
    }

    // Sort by creation date (newest first)
    workOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Convert to frontend format
    const formattedWorkOrders = workOrders.map(wo => ({
      id: wo.id,
      orderNumber: wo.order_number,
      title: wo.title,
      description: wo.description,
      machineId: wo.machine_id,
      machineName: wo.machine_name,
      quantity: Number(wo.quantity),
      status: wo.status,
      priority: wo.priority,
      plannedStartDate: wo.planned_start_date,
      plannedEndDate: wo.planned_end_date,
      actualStartDate: wo.actual_start_date,
      actualEndDate: wo.actual_end_date,
      estimatedDuration: wo.estimated_duration,
      actualDuration: wo.actual_duration,
      createdBy: wo.created_by,
      assignedTo: wo.assigned_to,
      createdAt: wo.created_at,
      updatedAt: wo.updated_at
    }));

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedWorkOrders = formattedWorkOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedWorkOrders,
        total: formattedWorkOrders.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(formattedWorkOrders.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Work orders fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İş emirleri yüklenirken hata oluştu'
    });
  }
});

// Get work order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workOrder = await dbAdmin.workOrders.getById(req.params.id);
    
    // Convert to frontend format
    const formattedWorkOrder = {
      id: workOrder.id,
      orderNumber: workOrder.order_number,
      title: workOrder.title,
      description: workOrder.description,
      machineId: workOrder.machine_id,
      machineName: workOrder.machine_name,
      quantity: Number(workOrder.quantity),
      status: workOrder.status,
      priority: workOrder.priority,
      plannedStartDate: workOrder.planned_start_date,
      plannedEndDate: workOrder.planned_end_date,
      actualStartDate: workOrder.actual_start_date,
      actualEndDate: workOrder.actual_end_date,
      estimatedDuration: workOrder.estimated_duration,
      actualDuration: workOrder.actual_duration,
      createdBy: workOrder.created_by,
      assignedTo: workOrder.assigned_to,
      createdAt: workOrder.created_at,
      updatedAt: workOrder.updated_at
    };

    res.json({
      success: true,
      data: formattedWorkOrder
    });
  } catch (error) {
    console.error('Work order fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'İş emri bulunamadı'
    });
  }
});

// Create new work order
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      machineId,
      machineName,
      priority,
      plannedStartDate,
      plannedEndDate,
      estimatedDuration
    } = req.body;

    // Validation
    if (!title || !machineId || !machineName || !priority || !plannedStartDate) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Generate order number
    const orderNumber = `WO${Date.now().toString().slice(-6)}`;

    const workOrderData = {
      order_number: orderNumber,
      title,
      description: description || '',
      machine_id: machineId,
      machine_name: machineName,
      quantity: 1, // Default quantity
      status: 'PLANNED',
      priority,
      planned_start_date: plannedStartDate,
      planned_end_date: plannedEndDate || null,
      actual_start_date: null,
      actual_end_date: null,
      estimated_duration: estimatedDuration || null,
      actual_duration: null,
      created_by: (req as any).user.id,
      assigned_to: null
    };

    const newWorkOrder = await dbAdmin.workOrders.create(workOrderData);

    // Convert to frontend format
    const formattedWorkOrder = {
      id: newWorkOrder.id,
      orderNumber: newWorkOrder.order_number,
      title: newWorkOrder.title,
      description: newWorkOrder.description,
      machineId: newWorkOrder.machine_id,
      machineName: newWorkOrder.machine_name,
      quantity: Number(newWorkOrder.quantity),
      status: newWorkOrder.status,
      priority: newWorkOrder.priority,
      plannedStartDate: newWorkOrder.planned_start_date,
      plannedEndDate: newWorkOrder.planned_end_date,
      actualStartDate: newWorkOrder.actual_start_date,
      actualEndDate: newWorkOrder.actual_end_date,
      estimatedDuration: newWorkOrder.estimated_duration,
      actualDuration: newWorkOrder.actual_duration,
      createdBy: newWorkOrder.created_by,
      assignedTo: newWorkOrder.assigned_to,
      createdAt: newWorkOrder.created_at,
      updatedAt: newWorkOrder.updated_at
    };

    res.status(201).json({
      success: true,
      data: formattedWorkOrder
    });
  } catch (error) {
    console.error('Work order creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İş emri oluşturulurken hata oluştu'
    });
  }
});

// Update work order
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      plannedStartDate,
      plannedEndDate,
      estimatedDuration,
      assignedTo
    } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (plannedStartDate) updateData.planned_start_date = plannedStartDate;
    if (plannedEndDate !== undefined) updateData.planned_end_date = plannedEndDate;
    if (estimatedDuration !== undefined) updateData.estimated_duration = estimatedDuration;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;

    const updatedWorkOrder = await dbAdmin.workOrders.update(req.params.id, updateData);

    // Convert to frontend format
    const formattedWorkOrder = {
      id: updatedWorkOrder.id,
      orderNumber: updatedWorkOrder.order_number,
      title: updatedWorkOrder.title,
      description: updatedWorkOrder.description,
      machineId: updatedWorkOrder.machine_id,
      machineName: updatedWorkOrder.machine_name,
      quantity: Number(updatedWorkOrder.quantity),
      status: updatedWorkOrder.status,
      priority: updatedWorkOrder.priority,
      plannedStartDate: updatedWorkOrder.planned_start_date,
      plannedEndDate: updatedWorkOrder.planned_end_date,
      actualStartDate: updatedWorkOrder.actual_start_date,
      actualEndDate: updatedWorkOrder.actual_end_date,
      estimatedDuration: updatedWorkOrder.estimated_duration,
      actualDuration: updatedWorkOrder.actual_duration,
      createdBy: updatedWorkOrder.created_by,
      assignedTo: updatedWorkOrder.assigned_to,
      createdAt: updatedWorkOrder.created_at,
      updatedAt: updatedWorkOrder.updated_at
    };

    res.json({
      success: true,
      data: formattedWorkOrder
    });
  } catch (error) {
    console.error('Work order update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İş emri güncellenirken hata oluştu'
    });
  }
});

// Update work order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz durum'
      });
    }

    const now = new Date().toISOString();
    const updateData: any = { status };

    // Get current work order to check status transitions
    const currentWorkOrder = await dbAdmin.workOrders.getById(req.params.id);
    
    if (!currentWorkOrder) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    // Update timestamps based on status change
    if (status === 'IN_PROGRESS' && currentWorkOrder.status === 'PLANNED') {
      updateData.actual_start_date = now;
    } else if (status === 'COMPLETED' && currentWorkOrder.status === 'IN_PROGRESS') {
      updateData.actual_end_date = now;
      
      // Calculate actual duration
      if (currentWorkOrder.actual_start_date) {
        const startTime = new Date(currentWorkOrder.actual_start_date);
        const endTime = new Date(now);
        updateData.actual_duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)); // hours
      }
    }

    const updatedWorkOrder = await dbAdmin.workOrders.update(req.params.id, updateData);

    // Auto-consume materials based on BOM when work order is completed
    if (status === 'COMPLETED' && currentWorkOrder.status !== 'COMPLETED') {
      await consumeMaterialsForWorkOrder(updatedWorkOrder.machine_id, (req as any).user.id);
    }

    // Convert to frontend format
    const formattedWorkOrder = {
      id: updatedWorkOrder.id,
      orderNumber: updatedWorkOrder.order_number,
      title: updatedWorkOrder.title,
      description: updatedWorkOrder.description,
      machineId: updatedWorkOrder.machine_id,
      machineName: updatedWorkOrder.machine_name,
      quantity: Number(updatedWorkOrder.quantity),
      status: updatedWorkOrder.status,
      priority: updatedWorkOrder.priority,
      plannedStartDate: updatedWorkOrder.planned_start_date,
      plannedEndDate: updatedWorkOrder.planned_end_date,
      actualStartDate: updatedWorkOrder.actual_start_date,
      actualEndDate: updatedWorkOrder.actual_end_date,
      estimatedDuration: updatedWorkOrder.estimated_duration,
      actualDuration: updatedWorkOrder.actual_duration,
      createdBy: updatedWorkOrder.created_by,
      assignedTo: updatedWorkOrder.assigned_to,
      createdAt: updatedWorkOrder.created_at,
      updatedAt: updatedWorkOrder.updated_at
    };

    res.json({
      success: true,
      data: formattedWorkOrder
    });
  } catch (error) {
    console.error('Work order status update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İş emri durumu güncellenirken hata oluştu'
    });
  }
});

// Delete work order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // First get the work order to check its status
    const workOrder = await dbAdmin.workOrders.getById(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    // Check if work order can be deleted (only planned orders)
    if (workOrder.status !== 'PLANNED') {
      return res.status(400).json({
        success: false,
        error: 'Sadece planlanan iş emirleri silinebilir'
      });
    }

    await dbAdmin.workOrders.delete(req.params.id);

    res.json({
      success: true,
      message: 'İş emri başarıyla silindi'
    });
  } catch (error) {
    console.error('Work order deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İş emri silinirken hata oluştu'
    });
  }
});

// Get work order statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    // Get all work orders from database
    const workOrders = await dbAdmin.workOrders.getAll();
    
    const stats = {
      total: workOrders.length,
      pending: workOrders.filter(wo => wo.status === 'PLANNED').length,
      inProgress: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
      completed: workOrders.filter(wo => wo.status === 'COMPLETED').length,
      cancelled: workOrders.filter(wo => wo.status === 'CANCELLED').length,
      highPriority: workOrders.filter(wo => wo.priority === 'HIGH').length,
      overdue: workOrders.filter(wo => {
        if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') return false;
        if (!wo.planned_end_date) return false;
        return new Date(wo.planned_end_date) < new Date();
      }).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Work order statistics error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenirken hata oluştu'
    });
  }
});

// Helper function to consume materials for work order
async function consumeMaterialsForWorkOrder(machineId: string, userId: string) {
  try {
    // Get BOM items for the machine
    const bomItems = await dbAdmin.bomItems.getByMachine(machineId);
    
    for (const bomItem of bomItems) {
      // Create material movement for consumption
      const movementData = {
        material_id: bomItem.material_id,
        material_name: bomItem.material_name || `Material ${bomItem.material_id}`,
        type: 'OUT' as const,
        quantity: Number(bomItem.quantity),
        reason: 'PRODUCTION',
        notes: `İş Emri Tüketimi - Makine: ${machineId}`,
        created_by: userId
      };

      // Create the movement
      await dbAdmin.materialMovements.create(movementData);

      // Update material stock
      const material = await dbAdmin.materials.getById(bomItem.material_id);
      if (material) {
        const newStock = Number(material.current_stock) - movementData.quantity;
        await dbAdmin.materials.update(bomItem.material_id, {
          current_stock: Math.max(0, newStock) // Prevent negative stock
        });
      }
    }
  } catch (error) {
    console.error('Material consumption error:', error instanceof Error ? error.message : JSON.stringify(error));
  }
}

export default router;