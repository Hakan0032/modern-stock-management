import express, { Request, Response } from 'express';
import { authenticateToken, requirePlanningAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import type { Machine, BOMItem } from '../../shared/types';

const router = express.Router();

// Get all machines with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    
    // Build query filters
    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    const machines = await dbAdmin.machines.getAll();
    let filteredMachines = machines;

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

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMachines = filteredMachines.slice(startIndex, endIndex);

    // Convert to frontend format
    const formattedMachines = paginatedMachines.map(machine => ({
      id: machine.id,
      code: machine.code,
      name: machine.name,
      description: machine.description,
      category: machine.category,
      location: machine.location,
      status: machine.status,
      manufacturer: machine.manufacturer,
      model: machine.model,
      serialNumber: machine.serial_number,
      installationDate: machine.installation_date,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at
    }));

    res.json({
      success: true,
      data: {
        data: formattedMachines,
        total: filteredMachines.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredMachines.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Machines fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Makineler yüklenirken hata oluştu'
    });
  }
});

// Get machine by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const machine = await dbAdmin.machines.getById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    // Convert to frontend format
    const formattedMachine = {
      id: machine.id,
      code: machine.code,
      name: machine.name,
      description: machine.description,
      category: machine.category,
      location: machine.location,
      status: machine.status,
      manufacturer: machine.manufacturer,
      model: machine.model,
      serialNumber: machine.serial_number,
      installationDate: machine.installation_date,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at
    };

    res.json({
      success: true,
      data: formattedMachine
    });
  } catch (error) {
    console.error('Machine fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
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
    const existingMachine = await dbAdmin.machines.getByCode(code);
    if (existingMachine) {
      return res.status(400).json({
        success: false,
        error: 'Bu kod ile makine zaten mevcut'
      });
    }

    const machineData = {
      code,
      name,
      description: description || '',
      category,
      location,
      status,
      manufacturer: manufacturer || '',
      model: model || '',
      serial_number: serialNumber || '',
      installation_date: installationDate || null
    };

    const newMachine = await dbAdmin.machines.create(machineData);

    // Convert to frontend format
    const formattedMachine = {
      id: newMachine.id,
      code: newMachine.code,
      name: newMachine.name,
      description: newMachine.description,
      category: newMachine.category,
      location: newMachine.location,
      status: newMachine.status,
      manufacturer: newMachine.manufacturer,
      model: newMachine.model,
      serialNumber: newMachine.serial_number,
      installationDate: newMachine.installation_date,
      createdAt: newMachine.created_at,
      updatedAt: newMachine.updated_at
    };

    res.status(201).json({
      success: true,
      data: formattedMachine
    });
  } catch (error) {
    console.error('Machine creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Makine oluşturulurken hata oluştu'
    });
  }
});

// Update machine
router.put('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
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

    // Check if code already exists (excluding current machine)
    if (code) {
      const existingMachine = await dbAdmin.machines.getByCode(code);
      if (existingMachine && existingMachine.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Bu kod ile makine zaten mevcut'
        });
      }
    }

    const updateData: any = {};
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (location) updateData.location = location;
    if (status) updateData.status = status;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (model !== undefined) updateData.model = model;
    if (serialNumber !== undefined) updateData.serial_number = serialNumber;
    if (installationDate !== undefined) updateData.installation_date = installationDate;

    const updatedMachine = await dbAdmin.machines.update(req.params.id, updateData);

    // Convert to frontend format
    const formattedMachine = {
      id: updatedMachine.id,
      code: updatedMachine.code,
      name: updatedMachine.name,
      description: updatedMachine.description,
      category: updatedMachine.category,
      location: updatedMachine.location,
      status: updatedMachine.status,
      manufacturer: updatedMachine.manufacturer,
      model: updatedMachine.model,
      serialNumber: updatedMachine.serial_number,
      installationDate: updatedMachine.installation_date,
      createdAt: updatedMachine.created_at,
      updatedAt: updatedMachine.updated_at
    };

    res.json({
      success: true,
      data: formattedMachine
    });
  } catch (error) {
    console.error('Machine update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Makine güncellenirken hata oluştu'
    });
  }
});

// Delete machine
router.delete('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    // Check if machine exists
    const machine = await dbAdmin.machines.getById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    // Remove associated BOM items first
    // Delete BOM items for this machine
    const bomItems = await dbAdmin.bomItems.getByMachine(req.params.id);
    for (const item of bomItems) {
      await dbAdmin.bomItems.delete(item.id);
    }

    // Delete the machine
    await dbAdmin.machines.delete(req.params.id);

    res.json({
      success: true,
      message: 'Makine başarıyla silindi'
    });
  } catch (error) {
    console.error('Machine deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Makine silinirken hata oluştu'
    });
  }
});

// Get machine BOM
router.get('/:id/bom', authenticateToken, async (req: Request, res: Response) => {
  try {
    const machine = await dbAdmin.machines.getById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Makine bulunamadı'
      });
    }

    const machineBOM = await dbAdmin.bomItems.getByMachine(req.params.id);

    // Convert to frontend format
    const formattedBOM = machineBOM.map(item => ({
      id: item.id,
      machineId: item.machine_id,
      materialId: item.material_id,
      materialName: item.material_name,
      materialCode: item.material_code,
      quantity: Number(item.quantity),
      unit: item.unit,

    }));

    res.json({
      success: true,
      data: formattedBOM
    });
  } catch (error) {
    console.error('BOM fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'BOM yüklenirken hata oluştu'
    });
  }
});

// Add BOM item to machine
router.post('/:id/bom', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const machine = await dbAdmin.machines.getById(req.params.id);
    
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

    } = req.body;

    // Validation
    if (!materialId || !materialName || !materialCode || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if material already exists in BOM
    const existingBOMItems = await dbAdmin.bomItems.getByMachine(req.params.id);
    const existingBOMItem = existingBOMItems.find(item => item.material_id === materialId);
    
    if (existingBOMItem) {
      return res.status(400).json({
        success: false,
        error: 'Bu malzeme BOM\'da zaten mevcut'
      });
    }

    const bomItemData = {
      machine_id: req.params.id,
      material_id: materialId,
      material_name: materialName,
      material_code: materialCode,
      quantity: parseFloat(quantity),
      unit,

    };

    const newBOMItem = await dbAdmin.bomItems.create(bomItemData);

    // Convert to frontend format
    const formattedBOMItem = {
      id: newBOMItem.id,
      machineId: newBOMItem.machine_id,
      materialId: newBOMItem.material_id,
      materialName: newBOMItem.material_name,
      materialCode: newBOMItem.material_code,
      quantity: Number(newBOMItem.quantity),
      unit: newBOMItem.unit,

    };

    res.status(201).json({
      success: true,
      data: formattedBOMItem
    });
  } catch (error) {
    console.error('BOM item creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'BOM öğesi eklenirken hata oluştu'
    });
  }
});

// Update BOM item
router.put('/:id/bom/:bomId', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;

    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);


    const updatedBOMItem = await dbAdmin.bomItems.update(req.params.bomId, updateData);

    if (!updatedBOMItem) {
      return res.status(404).json({
        success: false,
        error: 'BOM öğesi bulunamadı'
      });
    }

    // Convert to frontend format
    const formattedBOMItem = {
      id: updatedBOMItem.id,
      machineId: updatedBOMItem.machine_id,
      materialId: updatedBOMItem.material_id,
      materialName: updatedBOMItem.material_name,
      materialCode: updatedBOMItem.material_code,
      quantity: Number(updatedBOMItem.quantity),
      unit: updatedBOMItem.unit,

    };

    res.json({
      success: true,
      data: formattedBOMItem
    });
  } catch (error) {
    console.error('BOM item update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'BOM öğesi güncellenirken hata oluştu'
    });
  }
});

// Delete BOM item
router.delete('/:id/bom/:bomId', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    await dbAdmin.bomItems.delete(req.params.bomId);

    res.json({
      success: true,
      message: 'BOM öğesi başarıyla silindi'
    });
  } catch (error) {
    console.error('BOM item deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'BOM öğesi silinirken hata oluştu'
    });
  }
});

// Get machine categories
router.get('/categories/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const machines = await dbAdmin.machines.getAll();
    const categories = [...new Set(machines.map(m => m.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Kategoriler yüklenirken hata oluştu'
    });
  }
});

export default router;