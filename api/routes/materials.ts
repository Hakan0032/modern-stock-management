import express, { Request, Response } from 'express';
import { authenticateToken, requireMaterialAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import type { Material } from '../../shared/types';

const router = express.Router();

// Get all materials with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, stockLevel, page = 1, limit = 10 } = req.query;
    
    // Get all materials from Supabase
    let materials = await dbAdmin.materials.getAll();

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      materials = materials.filter(material => 
        material.name.toLowerCase().includes(searchLower) ||
        material.code.toLowerCase().includes(searchLower) ||
        material.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      materials = materials.filter(material => 
        material.category === category
      );
    }

    // Apply stock level filter
    if (stockLevel && stockLevel !== 'all') {
      materials = materials.filter(material => {
        const stockRatio = Number(material.current_stock) / Number(material.max_stock_level);
        switch (stockLevel) {
          case 'critical':
            return Number(material.current_stock) <= Number(material.min_stock_level);
          case 'low':
            return Number(material.current_stock) > Number(material.min_stock_level) && stockRatio < 0.3;
          case 'normal':
            return stockRatio >= 0.3 && stockRatio < 0.8;
          case 'high':
            return stockRatio >= 0.8;
          default:
            return true;
        }
      });
    }

    // Convert to frontend format
    const formattedMaterials = materials.map(material => ({
      id: material.id,
      code: material.code,
      name: material.name,
      description: material.description,
      category: material.category,
      unit: material.unit,
      currentStock: Number(material.current_stock),
      minStockLevel: Number(material.min_stock_level),
      maxStockLevel: Number(material.max_stock_level),
      supplier: material.supplier,
      location: material.location,
      barcode: material.barcode,
      imagePath: material.image_path,
      createdAt: material.created_at,
      updatedAt: material.updated_at
    }));

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMaterials = formattedMaterials.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedMaterials,
        total: formattedMaterials.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(formattedMaterials.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Materials fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Malzemeler yüklenirken hata oluştu'
    });
  }
});

// Get material by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const material = await dbAdmin.materials.getById(req.params.id);
    
    // Convert to frontend format
    const formattedMaterial = {
      id: material.id,
      code: material.code,
      name: material.name,
      description: material.description,
      category: material.category,
      unit: material.unit,
      currentStock: Number(material.current_stock),
      minStockLevel: Number(material.min_stock_level),
      maxStockLevel: Number(material.max_stock_level),
      supplier: material.supplier,
      location: material.location,
      barcode: material.barcode,
      imagePath: material.image_path,
      createdAt: material.created_at,
      updatedAt: material.updated_at
    };

    res.json({
      success: true,
      data: formattedMaterial
    });
  } catch (error) {
    console.error('Material fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'Malzeme bulunamadı'
    });
  }
});

// Create new material
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, description, category, unit, quantity, minStockLevel, maxStockLevel, supplier, location, barcode } = req.body;

    // Validate required fields
    if (!code || !name || !category || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if material code already exists
    try {
      await dbAdmin.materials.getByCode(code);
      return res.status(400).json({
        success: false,
        error: 'Bu malzeme kodu zaten kullanılıyor'
      });
    } catch {
      // Material doesn't exist, which is what we want
    }

    const materialData = {
      code,
      name,
      description,
      category,
      unit,
      current_stock: quantity ? parseFloat(quantity) : 0,
      min_stock_level: minStockLevel ? parseFloat(minStockLevel) : 0,
      max_stock_level: maxStockLevel ? parseFloat(maxStockLevel) : 0,
      supplier,
      location,
      barcode
    };

    const newMaterial = await dbAdmin.materials.create(materialData);

    // Convert to frontend format
    const formattedMaterial = {
      id: newMaterial.id,
      code: newMaterial.code,
      name: newMaterial.name,
      description: newMaterial.description,
      category: newMaterial.category,
      unit: newMaterial.unit,

      currentStock: Number(newMaterial.current_stock),
      minStockLevel: Number(newMaterial.min_stock_level),
      maxStockLevel: Number(newMaterial.max_stock_level),
      supplier: newMaterial.supplier,
      location: newMaterial.location,
      barcode: newMaterial.barcode,
      imagePath: newMaterial.image_path,
      createdAt: newMaterial.created_at,
      updatedAt: newMaterial.updated_at
    };

    res.status(201).json({
      success: true,
      data: formattedMaterial
    });
  } catch (error) {
    console.error('Material creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Malzeme oluşturulurken hata oluştu'
    });
  }
});

// Update material
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { code, name, description, category, unit, quantity, minStockLevel, maxStockLevel, supplier, location, barcode } = req.body;

    // Check if new code conflicts with existing materials (excluding current one)
    if (code) {
      try {
        const existingMaterial = await dbAdmin.materials.getByCode(code);
        if (existingMaterial.id !== req.params.id) {
          return res.status(400).json({
            success: false,
            error: 'Bu malzeme kodu zaten kullanılıyor'
          });
        }
      } catch {
        // Material doesn't exist, which is fine
      }
    }

    const updateData: any = {};
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (unit) updateData.unit = unit;

    if (quantity !== undefined) updateData.current_stock = parseFloat(quantity);
    if (minStockLevel !== undefined) updateData.min_stock_level = parseFloat(minStockLevel);
    if (maxStockLevel !== undefined) updateData.max_stock_level = parseFloat(maxStockLevel);
    if (supplier !== undefined) updateData.supplier = supplier;
    if (location !== undefined) updateData.location = location;
    if (barcode !== undefined) updateData.barcode = barcode;

    const updatedMaterial = await dbAdmin.materials.update(req.params.id, updateData);

    // Convert to frontend format
    const formattedMaterial = {
      id: updatedMaterial.id,
      code: updatedMaterial.code,
      name: updatedMaterial.name,
      description: updatedMaterial.description,
      category: updatedMaterial.category,
      unit: updatedMaterial.unit,

      currentStock: Number(updatedMaterial.current_stock),
      minStockLevel: Number(updatedMaterial.min_stock_level),
      maxStockLevel: Number(updatedMaterial.max_stock_level),
      supplier: updatedMaterial.supplier,
      location: updatedMaterial.location,
      barcode: updatedMaterial.barcode,
      imagePath: updatedMaterial.image_path,
      createdAt: updatedMaterial.created_at,
      updatedAt: updatedMaterial.updated_at
    };

    res.json({
      success: true,
      data: formattedMaterial
    });
  } catch (error) {
    console.error('Material update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Malzeme güncellenirken hata oluştu'
    });
  }
});

// Delete material
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await dbAdmin.materials.delete(req.params.id);

    res.json({
      success: true,
      message: 'Malzeme başarıyla silindi'
    });
  } catch (error) {
    console.error('Material deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'Malzeme bulunamadı'
    });
  }
});

// Get material categories
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const materials = await dbAdmin.materials.getAll();
    const categories = [...new Set(materials.map(m => m.category))];
    
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