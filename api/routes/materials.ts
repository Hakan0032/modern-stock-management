import express, { Request, Response } from 'express';
import { authenticateToken, requireMaterialAccess } from '../middleware/auth';
import { materials, getNextId } from '../data/mockData';
import type { Material } from '../../shared/types';

const router = express.Router();

// Get all materials with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, category, stockLevel, page = 1, limit = 10 } = req.query;
    let filteredMaterials = [...materials];

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredMaterials = filteredMaterials.filter(material => 
        material.name.toLowerCase().includes(searchLower) ||
        material.code.toLowerCase().includes(searchLower) ||
        material.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.category === category
      );
    }

    // Apply stock level filter
    if (stockLevel && stockLevel !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => {
        const stockRatio = material.currentStock / material.maxStockLevel;
        switch (stockLevel) {
          case 'critical':
            return material.currentStock <= material.minStockLevel;
          case 'low':
            return material.currentStock > material.minStockLevel && stockRatio < 0.3;
          case 'normal':
            return stockRatio >= 0.3 && stockRatio < 0.8;
          case 'high':
            return stockRatio >= 0.8;
          default:
            return true;
        }
      });
    }

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedMaterials,
        total: filteredMaterials.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredMaterials.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzemeler yüklenirken hata oluştu'
    });
  }
});

// Get material by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const material = materials.find(m => m.id === req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Malzeme bulunamadı'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzeme yüklenirken hata oluştu'
    });
  }
});

// Create new material
router.post('/', authenticateToken, requireMaterialAccess, async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      category,
      unit,
      unitPrice,
      currentStock,
      minStock,
      maxStock,
      location
    } = req.body;

    // Validation
    if (!code || !name || !category || !unit || unitPrice === undefined || 
        currentStock === undefined || minStock === undefined || maxStock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if code already exists
    const existingMaterial = materials.find(m => m.code === code);
    if (existingMaterial) {
      return res.status(400).json({
        success: false,
        error: 'Bu kod ile malzeme zaten mevcut'
      });
    }

    const newMaterial: Material = {
      id: getNextId(),
      code,
      name,
      description: description || '',
      category,
      unit,
      unitPrice: parseFloat(unitPrice),
      currentStock: parseInt(currentStock),
      minStockLevel: parseInt(minStock),
      maxStockLevel: parseInt(maxStock),
      location: location || 'Depo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    materials.push(newMaterial);

    res.status(201).json({
      success: true,
      data: newMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzeme oluşturulurken hata oluştu'
    });
  }
});

// Update material
router.put('/:id', authenticateToken, requireMaterialAccess, async (req: Request, res: Response) => {
  try {
    const materialIndex = materials.findIndex(m => m.id === req.params.id);
    
    if (materialIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Malzeme bulunamadı'
      });
    }

    const {
      code,
      name,
      description,
      category,
      unit,
      unitPrice,
      currentStock,
      minStock,
      maxStock,
      location
    } = req.body;

    // Check if code already exists (excluding current material)
    if (code && code !== materials[materialIndex].code) {
      const existingMaterial = materials.find(m => m.code === code && m.id !== req.params.id);
      if (existingMaterial) {
        return res.status(400).json({
          success: false,
          error: 'Bu kod ile malzeme zaten mevcut'
        });
      }
    }

    // Update material
    materials[materialIndex] = {
      ...materials[materialIndex],
      code: code || materials[materialIndex].code,
      name: name || materials[materialIndex].name,
      description: description !== undefined ? description : materials[materialIndex].description,
      category: category || materials[materialIndex].category,
      unit: unit || materials[materialIndex].unit,
      unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : materials[materialIndex].unitPrice,
      currentStock: currentStock !== undefined ? parseInt(currentStock) : materials[materialIndex].currentStock,
      minStockLevel: minStock !== undefined ? parseInt(minStock) : materials[materialIndex].minStockLevel,
      maxStockLevel: maxStock !== undefined ? parseInt(maxStock) : materials[materialIndex].maxStockLevel,
      location: location || materials[materialIndex].location,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: materials[materialIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzeme güncellenirken hata oluştu'
    });
  }
});

// Delete material
router.delete('/:id', authenticateToken, requireMaterialAccess, async (req: Request, res: Response) => {
  try {
    const materialIndex = materials.findIndex(m => m.id === req.params.id);
    
    if (materialIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Malzeme bulunamadı'
      });
    }

    materials.splice(materialIndex, 1);

    res.json({
      success: true,
      message: 'Malzeme başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Malzeme silinirken hata oluştu'
    });
  }
});

// Get material categories
router.get('/categories/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = [...new Set(materials.map(m => m.category))];
    
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