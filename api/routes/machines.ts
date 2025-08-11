import express, { Request, Response } from 'express';
import { authenticateToken, requirePlanningAccess } from '../middleware/auth';
import { machines, bomItems, getNextId } from '../data/mockData';
import type { Machine, BOMItem } from '../../shared/types';

const router = express.Router();

// Get all machines with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    let filteredMachines = [...machines];

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredMachines = filteredMachines.filter(machine => 
        machine.name.toLowerCase().includes(searchLower) ||
        machine.code.toLowerCase().includes(searchLower) ||

        machine.manufacturer?.toLowerCase().includes(searchLower) ||
        machine.model?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      filteredMachines = filteredMachines.filter(machine => 
        machine.status === status
      );
    }

    // Apply category filter
    if (category) {
      filteredMachines = filteredMachines.filter(machine => 
        machine.category === category
      );
    }

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMachines = filteredMachines.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedMachines,
        total: filteredMachines.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredMachines.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makineler yüklenirken hata oluştu'
    });
  }
});

// Get machine by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    res.json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makine yüklenirken hata oluştu'
    });
  }
});

// Create new machine
router.post('/', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      category,
      location,
      status,
      manufacturer,
      model,
      serialNumber,
      installationDate
    } = req.body;

    // Validation
    if (!code || !name || !category || !location || !status) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if code already exists
    const existingMachine = machines.find(m => m.code === code);
    if (existingMachine) {
      return res.status(400).json({
        success: false,
        error: 'Bu kod ile makine zaten mevcut'
      });
    }

    const newMachine: Machine = {
      id: getNextId(),
      code,
      name,

      category,
      location,
      status,
      manufacturer: manufacturer || '',
      model: model || '',


      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    machines.push(newMachine);

    res.status(201).json({
      success: true,
      data: newMachine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makine oluşturulurken hata oluştu'
    });
  }
});

// Update machine
router.put('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const machineIndex = machines.findIndex(m => m.id === req.params.id);
    
    if (machineIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    const {
      code,
      name,
      description,
      category,
      location,
      status,
      manufacturer,
      model,
      serialNumber,
      installationDate
    } = req.body;

    // Check if code already exists (excluding current machine)
    if (code && code !== machines[machineIndex].code) {
      const existingMachine = machines.find(m => m.code === code && m.id !== req.params.id);
      if (existingMachine) {
        return res.status(400).json({
          success: false,
          error: 'Bu kod ile makine zaten mevcut'
        });
      }
    }

    // Update machine
    machines[machineIndex] = {
      ...machines[machineIndex],
      code: code || machines[machineIndex].code,
      name: name || machines[machineIndex].name,

      category: category || machines[machineIndex].category,
      location: location || machines[machineIndex].location,
      status: status || machines[machineIndex].status,
      manufacturer: manufacturer !== undefined ? manufacturer : machines[machineIndex].manufacturer,
      model: model !== undefined ? model : machines[machineIndex].model,

      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: machines[machineIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makine güncellenirken hata oluştu'
    });
  }
});

// Delete machine
router.delete('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const machineIndex = machines.findIndex(m => m.id === req.params.id);
    
    if (machineIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    // Remove associated BOM items
    const bomItemsToRemove = bomItems.filter(item => item.machineId === req.params.id);
    bomItemsToRemove.forEach(item => {
      const itemIndex = bomItems.findIndex(b => b.id === item.id);
      if (itemIndex !== -1) {
        bomItems.splice(itemIndex, 1);
      }
    });

    machines.splice(machineIndex, 1);

    res.json({
      success: true,
      message: 'Makine başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Makine silinirken hata oluştu'
    });
  }
});

// Get machine BOM
router.get('/:id/bom', authenticateToken, async (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    const machineBOM = bomItems.filter(item => item.machineId === req.params.id);

    res.json({
      success: true,
      data: machineBOM
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOM yüklenirken hata oluştu'
    });
  }
});

// Add BOM item to machine
router.post('/:id/bom', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    const {
      materialId,
      materialName,
      materialCode,
      quantity,
      unit,
      unitPrice
    } = req.body;

    // Validation
    if (!materialId || !materialName || !materialCode || !quantity || !unit || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if material already exists in BOM
    const existingBOMItem = bomItems.find(item => 
      item.machineId === req.params.id && item.materialId === materialId
    );
    
    if (existingBOMItem) {
      return res.status(400).json({
        success: false,
        error: 'Bu malzeme BOM\'da zaten mevcut'
      });
    }

    const newBOMItem: BOMItem = {
      id: getNextId(),
      machineId: req.params.id,
      materialId,
      materialName,
      materialCode,
      quantity: parseFloat(quantity),
      unit,
      unitPrice: parseFloat(unitPrice)
    };

    bomItems.push(newBOMItem);

    res.status(201).json({
      success: true,
      data: newBOMItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOM öğesi eklenirken hata oluştu'
    });
  }
});

// Update BOM item
router.put('/:id/bom/:bomId', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const bomItemIndex = bomItems.findIndex(item => 
      item.id === req.params.bomId && item.machineId === req.params.id
    );
    
    if (bomItemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'BOM öğesi bulunamadı'
      });
    }

    const { quantity, unitPrice } = req.body;

    // Update BOM item
    bomItems[bomItemIndex] = {
      ...bomItems[bomItemIndex],
      quantity: quantity !== undefined ? parseFloat(quantity) : bomItems[bomItemIndex].quantity,
      unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : bomItems[bomItemIndex].unitPrice
    };

    res.json({
      success: true,
      data: bomItems[bomItemIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOM öğesi güncellenirken hata oluştu'
    });
  }
});

// Delete BOM item
router.delete('/:id/bom/:bomId', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const bomItemIndex = bomItems.findIndex(item => 
      item.id === req.params.bomId && item.machineId === req.params.id
    );
    
    if (bomItemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'BOM öğesi bulunamadı'
      });
    }

    bomItems.splice(bomItemIndex, 1);

    res.json({
      success: true,
      message: 'BOM öğesi başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'BOM öğesi silinirken hata oluştu'
    });
  }
});

// Get machine categories
router.get('/categories/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = [...new Set(machines.map(m => m.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kategoriler yüklenirken hata oluştu'
    });
  }
});

export default router;