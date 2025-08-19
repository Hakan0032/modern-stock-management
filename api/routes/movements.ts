import express, { Request, Response } from 'express';
import { authenticateToken, requireInventoryAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import type { MaterialMovement } from '../../shared/types';

const router = express.Router();

// Get all movements with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, type, dateFrom, dateTo, materialId, page = 1, limit = 10 } = req.query;
    
    // Get all movements from Supabase
    let movements = await dbAdmin.materialMovements.getAll();

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      movements = movements.filter(movement => 
        movement.material_name?.toLowerCase().includes(searchLower) ||
        movement.material_code?.toLowerCase().includes(searchLower) ||
        movement.reason?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (type && type !== 'all') {
      movements = movements.filter(movement => 
        movement.type === type
      );
    }

    // Apply material filter
    if (materialId) {
      movements = movements.filter(movement => 
        movement.material_id === materialId
      );
    }

    // Apply date filters
    if (dateFrom) {
      movements = movements.filter(movement => 
        new Date(movement.created_at) >= new Date(dateFrom as string)
      );
    }

    if (dateTo) {
      movements = movements.filter(movement => 
        new Date(movement.created_at) <= new Date((dateTo as string) + 'T23:59:59')
      );
    }

    // Sort by date (newest first)
    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Convert to frontend format
    const formattedMovements = movements.map(movement => ({
      id: movement.id,
      materialId: movement.material_id,
      materialName: movement.material_name,
      materialCode: movement.material_code,
      type: movement.type,
      quantity: Number(movement.quantity),
      unit: movement.unit,

      reason: movement.reason,
      location: movement.location,
      performedBy: movement.performed_by,
      workOrderId: movement.work_order_id,
      createdAt: movement.created_at
    }));

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMovements = formattedMovements.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedMovements,
        total: formattedMovements.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(formattedMovements.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Movements fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Hareketler yüklenirken hata oluştu'
    });
  }
});

// Get movement by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const movement = await dbAdmin.materialMovements.getById(req.params.id);
    
    // Convert to frontend format
    const formattedMovement = {
      id: movement.id,
      materialId: movement.material_id,
      materialName: movement.material_name,
      materialCode: movement.material_code,
      type: movement.type,
      quantity: Number(movement.quantity),
      unit: movement.unit,

      reason: movement.reason,
      location: movement.location,
      performedBy: movement.performed_by,
      workOrderId: movement.work_order_id,
      createdAt: movement.created_at
    };

    res.json({
      success: true,
      data: formattedMovement
    });
  } catch (error) {
    console.error('Movement fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'Hareket bulunamadı'
    });
  }
});

// Create new movement (stock in/out)
router.post('/', authenticateToken, requireInventoryAccess, async (req: Request, res: Response) => {
  try {
    const {
      materialId,
      type,
      quantity,
      description,
      workOrderId
    } = req.body;

    // Validation
    if (!materialId || !type || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik veya geçersiz'
      });
    }

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz hareket tipi'
      });
    }

    // Find material
    const material = await dbAdmin.materials.getById(materialId);

    // Check stock for OUT movements
    if (type === 'OUT' && Number(material.current_stock) < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Yetersiz stok'
      });
    }



    // Create movement data
    const movementData = {
      material_id: materialId,
      material_name: material.name,
      material_code: material.code,
      type,
      quantity: parseInt(quantity),
      unit: material.unit,

      reason: description || '',
      location: material.location || 'Depo',
      performed_by: (req as any).user.id,
      work_order_id: workOrderId || null
    };

    // Create movement
    const newMovement = await dbAdmin.materialMovements.create(movementData);

    // Update material stock
    const newStock = type === 'IN' 
      ? Number(material.current_stock) + parseInt(quantity)
      : Number(material.current_stock) - parseInt(quantity);
    
    await dbAdmin.materials.update(materialId, { current_stock: newStock });

    // Convert to frontend format
    const formattedMovement = {
      id: newMovement.id,
      materialId: newMovement.material_id,
      materialName: newMovement.material_name,
      materialCode: newMovement.material_code,
      type: newMovement.type,
      quantity: Number(newMovement.quantity),
      unit: newMovement.unit,

      reason: newMovement.reason,
      location: newMovement.location,
      performedBy: newMovement.performed_by,
      workOrderId: newMovement.work_order_id,
      createdAt: newMovement.created_at
    };

    res.status(201).json({
      success: true,
      data: formattedMovement
    });
  } catch (error) {
    console.error('Movement creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Hareket oluşturulurken hata oluştu'
    });
  }
});

// Get movement statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Get all movements from Supabase
    const allMovements = await dbAdmin.materialMovements.getAll();

    // Today's movements
    const todayMovements = allMovements.filter(m => {
      const movementDate = new Date(m.created_at);
      return movementDate >= todayStart && movementDate < todayEnd;
    });

    const todayInbound = todayMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + Number(m.quantity), 0);

    const todayOutbound = todayMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + Number(m.quantity), 0);

    // This month's movements
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthMovements = allMovements.filter(m => {
      const movementDate = new Date(m.created_at);
      return movementDate >= thisMonthStart;
    });

    const monthlyInbound = thisMonthMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + Number(m.quantity), 0);

    const monthlyOutbound = thisMonthMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + Number(m.quantity), 0);

    res.json({
      success: true,
      data: {
        today: {
          inbound: todayInbound,
          outbound: todayOutbound,
          total: todayMovements.length
        },
        monthly: {
          inbound: monthlyInbound,
          outbound: monthlyOutbound,
          total: thisMonthMovements.length
        },
        total: allMovements.length
      }
    });
  } catch (error) {
    console.error('Movement stats error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenirken hata oluştu'
    });
  }
});

// Get movements by material
router.get('/material/:materialId', async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { limit = 10 } = req.query;

    // Get movements for specific material
    const allMovements = await dbAdmin.materialMovements.getAll();
    const materialMovementsFiltered = allMovements
      .filter(m => m.material_id === materialId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, parseInt(limit as string));

    // Convert to frontend format
    const formattedMovements = materialMovementsFiltered.map(movement => ({
      id: movement.id,
      materialId: movement.material_id,
      materialName: movement.material_name,
      materialCode: movement.material_code,
      type: movement.type,
      quantity: Number(movement.quantity),
      unit: movement.unit,

      reason: movement.reason,
      location: movement.location,
      performedBy: movement.performed_by,
      workOrderId: movement.work_order_id,
      createdAt: movement.created_at
    }));

    res.json({
      success: true,
      data: formattedMovements
    });
  } catch (error) {
    console.error('Material movements error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Malzeme hareketleri yüklenirken hata oluştu'
    });
  }
});

// DELETE /api/movements/:id - Delete a movement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting movement with ID:', id);

    // Check if movement exists
    const movement = await dbAdmin.materialMovements.getById(id);

    if (!movement) {
      console.log('Movement not found');
      return res.status(404).json({ error: 'Hareket bulunamadı' });
    }

    // Delete the movement
    await dbAdmin.materialMovements.delete(id);

    console.log('Movement deleted successfully');
    res.json({ message: 'Hareket başarıyla silindi' });
  } catch (error) {
    console.error('Delete movement error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;