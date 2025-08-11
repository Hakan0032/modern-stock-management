import express, { Request, Response } from 'express';
import { authenticateToken, requirePlanningAccess } from '../middleware/auth';
import { workOrders, materials, bomItems, materialMovements, getNextId } from '../data/mockData';
import type { WorkOrder, MaterialMovement } from '../../shared/types';

const router = express.Router();

// Get all work orders with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, status, priority, machineId, page = 1, limit = 10 } = req.query;
    let filteredWorkOrders = [...workOrders];

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        wo.orderNumber.toLowerCase().includes(searchLower) ||
        wo.title.toLowerCase().includes(searchLower) ||
        wo.description?.toLowerCase().includes(searchLower) ||
        wo.machineName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        wo.status === status
      );
    }

    // Apply priority filter
    if (priority) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        wo.priority === priority
      );
    }

    // Apply machine filter
    if (machineId) {
      filteredWorkOrders = filteredWorkOrders.filter(wo => 
        wo.machineId === machineId
      );
    }

    // Sort by creation date (newest first)
    filteredWorkOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedWorkOrders = filteredWorkOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedWorkOrders,
        total: filteredWorkOrders.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredWorkOrders.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emirleri yüklenirken hata oluştu'
    });
  }
});

// Get work order by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const workOrder = workOrders.find(wo => wo.id === req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    res.json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri yüklenirken hata oluştu'
    });
  }
});

// Create new work order
router.post('/', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
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

    const newWorkOrder: WorkOrder = {
      id: getNextId(),
      orderNumber,
      title,
      description: description || '',
      machineId,
      machineName,
      quantity: 1, // Default quantity
      status: 'PLANNED',
      priority,
      plannedStartDate,
      plannedEndDate: plannedEndDate || null,
      actualStartDate: null,
      actualEndDate: null,
      estimatedDuration: estimatedDuration || null,
      actualDuration: null,
      createdBy: (req as any).user.id,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    workOrders.push(newWorkOrder);

    res.status(201).json({
      success: true,
      data: newWorkOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri oluşturulurken hata oluştu'
    });
  }
});

// Update work order
router.put('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const workOrderIndex = workOrders.findIndex(wo => wo.id === req.params.id);
    
    if (workOrderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    const {
      title,
      description,
      priority,
      plannedStartDate,
      plannedEndDate,
      estimatedDuration,
      assignedTo
    } = req.body;

    // Update work order
    workOrders[workOrderIndex] = {
      ...workOrders[workOrderIndex],
      title: title || workOrders[workOrderIndex].title,
      description: description !== undefined ? description : workOrders[workOrderIndex].description,
      priority: priority || workOrders[workOrderIndex].priority,
      plannedStartDate: plannedStartDate || workOrders[workOrderIndex].plannedStartDate,
      plannedEndDate: plannedEndDate !== undefined ? plannedEndDate : workOrders[workOrderIndex].plannedEndDate,
      estimatedDuration: estimatedDuration !== undefined ? estimatedDuration : workOrders[workOrderIndex].estimatedDuration,
      assignedTo: assignedTo !== undefined ? assignedTo : workOrders[workOrderIndex].assignedTo,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: workOrders[workOrderIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri güncellenirken hata oluştu'
    });
  }
});

// Update work order status
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const workOrderIndex = workOrders.findIndex(wo => wo.id === req.params.id);
    
    if (workOrderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    const { status } = req.body;
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz durum'
      });
    }

    const currentWorkOrder = workOrders[workOrderIndex];
    const now = new Date().toISOString();

    // Update timestamps based on status change
    if (status === 'IN_PROGRESS' && currentWorkOrder.status === 'PLANNED') {
      currentWorkOrder.actualStartDate = now;
    } else if (status === 'COMPLETED' && currentWorkOrder.status === 'IN_PROGRESS') {
      currentWorkOrder.actualEndDate = now;
      
      // Calculate actual duration
      if (currentWorkOrder.actualStartDate) {
        const startTime = new Date(currentWorkOrder.actualStartDate);
        const endTime = new Date(now);
        currentWorkOrder.actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)); // hours
      }

      // Auto-consume materials based on BOM when work order is completed
      await consumeMaterialsForWorkOrder(currentWorkOrder.machineId, (req as any).user.id);
    }

    // Update status
    workOrders[workOrderIndex] = {
      ...currentWorkOrder,
      status,
      updatedAt: now
    };

    res.json({
      success: true,
      data: workOrders[workOrderIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri durumu güncellenirken hata oluştu'
    });
  }
});

// Delete work order
router.delete('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const workOrderIndex = workOrders.findIndex(wo => wo.id === req.params.id);
    
    if (workOrderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'İş emri bulunamadı'
      });
    }

    // Check if work order can be deleted
    const workOrder = workOrders[workOrderIndex];
    if (workOrder.status === 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        error: 'Devam eden iş emri silinemez'
      });
    }

    workOrders.splice(workOrderIndex, 1);

    res.json({
      success: true,
      message: 'İş emri başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İş emri silinirken hata oluştu'
    });
  }
});

// Get work order statistics
router.get('/stats/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = {
      total: workOrders.length,
      pending: workOrders.filter(wo => wo.status === 'PLANNED').length,
      inProgress: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
      completed: workOrders.filter(wo => wo.status === 'COMPLETED').length,
      cancelled: workOrders.filter(wo => wo.status === 'CANCELLED').length,
      highPriority: workOrders.filter(wo => wo.priority === 'HIGH').length,
      overdue: workOrders.filter(wo => {
        if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') return false;
        if (!wo.plannedEndDate) return false;
        return new Date(wo.plannedEndDate) < new Date();
      }).length
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

// Helper function to consume materials for work order
async function consumeMaterialsForWorkOrder(machineId: string, userId: string) {
  try {
    // Get BOM items for the machine
    const machineBOM = bomItems.filter(item => item.machineId === machineId);
    
    for (const bomItem of machineBOM) {
      // Find the material
      const materialIndex = materials.findIndex(m => m.id === bomItem.materialId);
      
      if (materialIndex !== -1) {
        const material = materials[materialIndex];
        const consumeQuantity = bomItem.quantity;
        
        // Check if enough stock is available
        if (material.currentStock >= consumeQuantity) {
          // Update material stock
          materials[materialIndex].currentStock -= consumeQuantity;
          materials[materialIndex].updatedAt = new Date().toISOString();
          
          // Create movement record
          const movement: MaterialMovement = {
            id: getNextId(),
            materialId: bomItem.materialId,
            materialName: bomItem.materialName,
            materialCode: bomItem.materialCode,
            type: 'OUT',
            quantity: consumeQuantity,
            unit: bomItem.unit,
            unitPrice: bomItem.unitPrice,
            totalPrice: consumeQuantity * bomItem.unitPrice,
            reason: `İş Emri Tüketimi - Makine: ${machineId}`,
            location: material.location || 'Depo',
            performedBy: userId,
            createdAt: new Date().toISOString()
          };
          
          materialMovements.push(movement);
        }
      }
    }
  } catch (error) {
    console.error('Material consumption error:', error);
  }
}

export default router;