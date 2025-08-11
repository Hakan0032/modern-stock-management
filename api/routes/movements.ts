import express, { Request, Response } from 'express';
import { authenticateToken, requireInventoryAccess } from '../middleware/auth';
import { materialMovements, materials, getNextId } from '../data/mockData';
import type { MaterialMovement } from '../../shared/types';

const router = express.Router();

// Get all movements with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, type, dateFrom, dateTo, materialId, page = 1, limit = 10 } = req.query;
    let filteredMovements = [...materialMovements];

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredMovements = filteredMovements.filter(movement => 
        movement.materialName?.toLowerCase().includes(searchLower) ||
        movement.materialCode?.toLowerCase().includes(searchLower) ||
        movement.reason?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (type && type !== 'all') {
      filteredMovements = filteredMovements.filter(movement => 
        movement.type === type
      );
    }

    // Apply material filter
    if (materialId) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.materialId === materialId
      );
    }

    // Apply date filters
    if (dateFrom) {
      filteredMovements = filteredMovements.filter(movement => 
        new Date(movement.createdAt) >= new Date(dateFrom as string)
      );
    }

    if (dateTo) {
      filteredMovements = filteredMovements.filter(movement => 
        new Date(movement.createdAt) <= new Date((dateTo as string) + 'T23:59:59')
      );
    }

    // Sort by date (newest first)
    filteredMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedMovements,
        total: filteredMovements.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredMovements.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hareketler yüklenirken hata oluştu'
    });
  }
});

// Get movement by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const movement = materialMovements.find(m => m.id === req.params.id);
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        error: 'Hareket bulunamadı'
      });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hareket yüklenirken hata oluştu'
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
    const material = materials.find(m => m.id === materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Malzeme bulunamadı'
      });
    }

    // Check stock for OUT movements
    if (type === 'OUT' && material.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Yetersiz stok'
      });
    }

    // Create movement
    const newMovement: MaterialMovement = {
      id: getNextId(),
      materialId,
      materialName: material.name,
      materialCode: material.code,
      type,
      quantity: parseInt(quantity),
      unit: material.unit,
      unitPrice: material.unitPrice,
      totalPrice: parseInt(quantity) * material.unitPrice,
      reason: description || '',
      location: material.location || 'Depo',
      performedBy: (req as any).user.id,
      createdAt: new Date().toISOString()
    };

    materialMovements.push(newMovement);

    // Update material stock
    const materialIndex = materials.findIndex(m => m.id === materialId);
    if (type === 'IN') {
      materials[materialIndex].currentStock += parseInt(quantity);
    } else {
      materials[materialIndex].currentStock -= parseInt(quantity);
    }
    materials[materialIndex].updatedAt = new Date().toISOString();

    res.status(201).json({
      success: true,
      data: newMovement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hareket oluşturulurken hata oluştu'
    });
  }
});

// Get movement statistics
router.get('/stats/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Today's movements
    const todayMovements = materialMovements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate >= todayStart && movementDate < todayEnd;
    });

    const todayInbound = todayMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);

    const todayOutbound = todayMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

    // This month's movements
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthMovements = materialMovements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate >= thisMonthStart;
    });

    const monthlyInbound = thisMonthMovements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);

    const monthlyOutbound = thisMonthMovements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

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
        total: materialMovements.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenirken hata oluştu'
    });
  }
});

// Get movements by material
router.get('/material/:materialId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { limit = 10 } = req.query;

    const materialMovementsFiltered = materialMovements
      .filter(m => m.materialId === materialId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: materialMovementsFiltered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzeme hareketleri yüklenirken hata oluştu'
    });
  }
});

export default router;