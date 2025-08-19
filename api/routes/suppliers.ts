import express, { Request, Response } from 'express';
import { authenticateToken, requirePlanningAccess } from '../middleware/auth';
import { dbAdmin } from '../lib/supabase';
import type { Supplier } from '../../shared/types';

const router = express.Router();

// Get all suppliers with filtering
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    // Build query filters
    const filters: any = {};
    if (status) filters.status = status;

    const suppliers = await dbAdmin.suppliers.getAll();
    let filteredSuppliers = suppliers;

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.code.toLowerCase().includes(searchLower) ||
        supplier.contact_person?.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    // Convert to frontend format
    const formattedSuppliers = paginatedSuppliers.map(supplier => ({
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      status: supplier.status,
      createdAt: supplier.created_at,
      updatedAt: supplier.updated_at
    }));

    res.json({
      success: true,
      data: {
        data: formattedSuppliers,
        total: filteredSuppliers.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredSuppliers.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Suppliers fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Tedarikçiler yüklenirken hata oluştu'
    });
  }
});

// Get supplier by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const supplier = await dbAdmin.suppliers.getById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Tedarikçi bulunamadı'
      });
    }

    // Convert to frontend format
    const formattedSupplier = {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      status: supplier.status,
      createdAt: supplier.created_at,
      updatedAt: supplier.updated_at
    };

    res.json({
      success: true,
      data: formattedSupplier
    });
  } catch (error) {
    console.error('Supplier fetch error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Tedarikçi yüklenirken hata oluştu'
    });
  }
});

// Create new supplier
router.post('/', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
      status
    } = req.body;

    // Validation
    if (!code || !name || !status) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if code already exists
    const existingSupplier = await dbAdmin.suppliers.getByCode(code);
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        error: 'Bu kod ile tedarikçi zaten mevcut'
      });
    }

    const supplierData = {
      code,
      name,
      contact_person: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      status
    };

    const newSupplier = await dbAdmin.suppliers.create(supplierData);

    // Convert to frontend format
    const formattedSupplier = {
      id: newSupplier.id,
      code: newSupplier.code,
      name: newSupplier.name,
      contactPerson: newSupplier.contact_person,
      email: newSupplier.email,
      phone: newSupplier.phone,
      address: newSupplier.address,
      status: newSupplier.status,
      createdAt: newSupplier.created_at,
      updatedAt: newSupplier.updated_at
    };

    res.status(201).json({
      success: true,
      data: formattedSupplier
    });
  } catch (error) {
    console.error('Supplier creation error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Tedarikçi oluşturulurken hata oluştu'
    });
  }
});

// Update supplier
router.put('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
      status
    } = req.body;

    // Check if code already exists (excluding current supplier)
    if (code) {
      const existingSupplier = await dbAdmin.suppliers.getByCode(code);
      if (existingSupplier && existingSupplier.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Bu kod ile tedarikçi zaten mevcut'
        });
      }
    }

    const updateData: any = {};
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (contactPerson !== undefined) updateData.contact_person = contactPerson;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (status) updateData.status = status;

    const updatedSupplier = await dbAdmin.suppliers.update(req.params.id, updateData);

    // Convert to frontend format
    const formattedSupplier = {
      id: updatedSupplier.id,
      code: updatedSupplier.code,
      name: updatedSupplier.name,
      contactPerson: updatedSupplier.contact_person,
      email: updatedSupplier.email,
      phone: updatedSupplier.phone,
      address: updatedSupplier.address,
      status: updatedSupplier.status,
      createdAt: updatedSupplier.created_at,
      updatedAt: updatedSupplier.updated_at
    };

    res.json({
      success: true,
      data: formattedSupplier
    });
  } catch (error) {
    console.error('Supplier update error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Tedarikçi güncellenirken hata oluştu'
    });
  }
});

// Delete supplier
router.delete('/:id', authenticateToken, requirePlanningAccess, async (req: Request, res: Response) => {
  try {
    // Check if supplier exists
    const supplier = await dbAdmin.suppliers.getById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Tedarikçi bulunamadı'
      });
    }

    // Delete the supplier
    await dbAdmin.suppliers.delete(req.params.id);

    res.json({
      success: true,
      message: 'Tedarikçi başarıyla silindi'
    });
  } catch (error) {
    console.error('Supplier deletion error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Tedarikçi silinirken hata oluştu'
    });
  }
});

export default router;