import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';

const router = express.Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await dbAdmin.categories.getAll();
    
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

// Get category by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await dbAdmin.categories.getById(req.params.id);
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Category fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'Kategori bulunamadı'
    });
  }
});

// Create new category
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Kategori adı gereklidir'
      });
    }

    // Check if category name already exists
    try {
      await dbAdmin.categories.getByName(name);
      return res.status(400).json({
        success: false,
        error: 'Bu kategori adı zaten kullanılıyor'
      });
    } catch {
      // Category doesn't exist, which is what we want
    }

    const categoryData = {
      name,
      description: description || null
    };

    const newCategory = await dbAdmin.categories.create(categoryData);

    res.status(201).json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    console.error('Category creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Kategori oluşturulurken hata oluştu'
    });
  }
});

// Update category
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if new name conflicts with existing categories (excluding current one)
    if (name) {
      try {
        const existingCategory = await dbAdmin.categories.getByName(name);
        if (existingCategory.id !== req.params.id) {
          return res.status(400).json({
            success: false,
            error: 'Bu kategori adı zaten kullanılıyor'
          });
        }
      } catch {
        // Category doesn't exist, which is fine
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await dbAdmin.categories.update(req.params.id, updateData);

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Category update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Kategori güncellenirken hata oluştu'
    });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if category is being used by any materials
    const materials = await dbAdmin.materials.getAll();
    const categoryInUse = materials.some(material => material.category === req.params.id);
    
    if (categoryInUse) {
      return res.status(400).json({
        success: false,
        error: 'Bu kategori malzemeler tarafından kullanılıyor, silinemez'
      });
    }

    await dbAdmin.categories.delete(req.params.id);

    res.json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    console.error('Category deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(404).json({
      success: false,
      error: 'Kategori bulunamadı'
    });
  }
});

export default router;