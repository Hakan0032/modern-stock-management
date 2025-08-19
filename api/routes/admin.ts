import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdminAccess } from '../middleware/auth';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, PaginatedResponse, UserStats, SystemSettings, SystemLog } from '../../shared/types';
import suppliersRoutes from './suppliers.ts';

const router = express.Router();

// Import users data and helper function from mockData
import { users, getNextId } from '../data/mockData';

// Get all users with filtering and pagination
router.get('/users', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { search, role, status, page = '1', limit = '10' } = req.query;
    
    let filteredUsers = [...users];

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        (user.department && user.department.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (role && typeof role === 'string') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Apply status filter
    if (status && typeof status === 'string') {
      const isActive = status === 'active';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user);

    const response: PaginatedResponse<Omit<User, 'password'>> = {
      data: safeUsers,
      total: filteredUsers.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredUsers.length / limitNum)
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcılar yüklenirken hata oluştu'
    });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Remove password from response
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı yüklenirken hata oluştu'
    });
  }
});

// Create new user
router.post('/users', authenticateToken, requireAdminAccess, async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
  try {
    const { username, email, password, firstName, lastName, role, department, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar eksik'
      });
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    // Check if email already exists
    const existingEmail = users.find(u => u.email === email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'planner', 'operator', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: getNextId(),
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role as UserRole,
      department: department || null,
      phone: phone || null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);

    // Remove password from response
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı oluşturulurken hata oluştu'
    });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireAdminAccess, async (req: Request<{ id: string }, {}, UpdateUserRequest>, res: Response) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const { username, email, firstName, lastName, role, department, phone, isActive } = req.body;

    // Check if username already exists (excluding current user)
    if (username && username !== users[userIndex].username) {
      const existingUser = users.find(u => u.username === username && u.id !== req.params.id);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Bu kullanıcı adı zaten kullanılıyor'
        });
      }
    }

    // Check if email already exists (excluding current user)
    if (email && email !== users[userIndex].email) {
      const existingEmail = users.find(u => u.email === email && u.id !== req.params.id);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Bu e-posta adresi zaten kullanılıyor'
        });
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'manager', 'planner', 'operator', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz rol'
        });
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      role: (role as UserRole) || users[userIndex].role,
      department: department !== undefined ? department : users[userIndex].department,
      phone: phone !== undefined ? phone : users[userIndex].phone,
      isActive: isActive !== undefined ? isActive : users[userIndex].isActive,
      updatedAt: new Date().toISOString()
    };

    // Remove password from response
    const { password, ...safeUser } = users[userIndex];

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı güncellenirken hata oluştu'
    });
  }
});

// Change user password
router.patch('/users/:id/password', authenticateToken, requireAdminAccess, async (req: Request<{ id: string }, {}, { newPassword: string }>, res: Response) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Şifre başarıyla güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Şifre güncellenirken hata oluştu'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Prevent deleting the last admin
    const user = users[userIndex];
    if (user.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Son aktif admin kullanıcı silinemez'
        });
      }
    }

    // Prevent users from deleting themselves
    if (req.params.id === (req as any).user.id) {
      return res.status(400).json({
        success: false,
        error: 'Kendi hesabınızı silemezsiniz'
      });
    }

    users.splice(userIndex, 1);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı silinirken hata oluştu'
    });
  }
});

// Get user statistics
router.get('/stats/users', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    
    const roleStats = {
      admin: users.filter(u => u.role === 'admin').length,
      manager: users.filter(u => u.role === 'manager').length,
      planner: users.filter(u => u.role === 'planner').length,
      operator: users.filter(u => u.role === 'operator').length,
      viewer: users.filter(u => u.role === 'viewer').length
    };

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = users.filter(u => 
      new Date(u.createdAt) >= thirtyDaysAgo
    ).length;

    // Recent logins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogins = users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) >= sevenDaysAgo
    ).length;

    const stats: UserStats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      recentRegistrations,
      recentLogins
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı istatistikleri yüklenirken hata oluştu'
    });
  }
});

// Get system settings
router.get('/settings', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    // Mock system settings - in a real app, these would come from a database
    const settings: SystemSettings = {
      general: {
        companyName: 'Mermer Makinesi A.Ş.',
        timezone: 'Europe/Istanbul',
        language: 'tr',
        currency: 'TRY',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      },
      inventory: {
        autoReorderEnabled: true,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        defaultLocation: 'Ana Depo',
        enableBarcodeScanning: true
      },
      workOrders: {
        autoNumbering: true,
        numberPrefix: 'WO',
        requireApproval: false,
        autoMaterialConsumption: true,
        defaultPriority: 'Orta'
      },
      notifications: {
        emailNotifications: true,
        lowStockAlerts: true,
        workOrderAlerts: true,
        systemMaintenanceAlerts: true,
        reportScheduling: true
      },
      security: {
        sessionTimeout: 480, // minutes
        passwordMinLength: 6,
        requirePasswordChange: false,
        passwordChangeInterval: 90, // days
        enableTwoFactor: false,
        maxLoginAttempts: 5
      },
      backup: {
        autoBackup: true,
        backupInterval: 'daily',
        retentionPeriod: 30, // days
        lastBackup: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sistem ayarları yüklenirken hata oluştu'
    });
  }
});

// Update system settings
router.put('/settings', authenticateToken, requireAdminAccess, async (req: Request<{}, {}, { category: string; settings: any }>, res: Response) => {
  try {
    const { category, settings } = req.body;

    if (!category || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Kategori ve ayarlar gereklidir'
      });
    }

    const validCategories = ['general', 'inventory', 'workOrders', 'notifications', 'security', 'backup'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz ayar kategorisi'
      });
    }

    // In a real application, you would save these settings to a database
    // For now, we'll just return success
    res.json({
      success: true,
      message: `${category} ayarları başarıyla güncellendi`,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sistem ayarları güncellenirken hata oluştu'
    });
  }
});

// Get system logs
router.get('/logs', authenticateToken, requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { level, startDate, endDate, page = '1', limit = '50' } = req.query;
    
    // Mock system logs - in a real app, these would come from a logging system
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'auth',
        message: 'Kullanıcı giriş yaptı',
        userId: 'user1',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: 'warning',
        category: 'inventory',
        message: 'Düşük stok uyarısı',
        details: 'Malzeme: MAL001 - Mevcut stok: 5'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        level: 'error',
        category: 'system',
        message: 'Veritabanı bağlantı hatası',
        error: 'Connection timeout'
      }
    ];

    let filteredLogs = [...mockLogs];

    // Apply filters
    if (level && typeof level === 'string') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (startDate && typeof startDate === 'string') {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(startDate)
      );
    }

    if (endDate && typeof endDate === 'string') {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(endDate)
      );
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    const response: PaginatedResponse<SystemLog> = {
      data: paginatedLogs,
      total: filteredLogs.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredLogs.length / limitNum)
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sistem logları yüklenirken hata oluştu'
    });
  }
});

// Mount suppliers routes under admin namespace
router.use('/suppliers', suppliersRoutes);

export default router;