/**
 * Vercel deploy entry handler, for serverless deployment
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User, UserRole } from '../shared/types';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Add type augmentation for express
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

// Types - User is imported from shared/types

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Mock Data
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    department: 'IT',
    phone: '+90 555 123 4567',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'manager',
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    department: 'Production',
    phone: '+90 555 234 5678',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'operator',
    firstName: 'Operator',
    lastName: 'User',
    email: 'operator@example.com',
    password: 'password123',
    role: 'operator',
    department: 'Production',
    phone: '+90 555 345 6789',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const materials = [
  {
    id: '1',
    code: 'MAT001',
    name: 'Mermer Blok A1',
    description: 'Yüksek kalite beyaz mermer blok',
    category: 'Ham Madde',
    unit: 'ton',
    currentStock: 150,
    minStock: 50,
    maxStock: 300,
    unitPrice: 2500,
    supplier: 'Afyon Mermer A.Ş.',
    location: 'Depo A-1',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    code: 'MAT002',
    name: 'Kesme Diski 350mm',
    description: 'Elmas kesme diski 350mm çap',
    category: 'Yedek Parça',
    unit: 'adet',
    currentStock: 25,
    minStock: 10,
    maxStock: 100,
    unitPrice: 450,
    supplier: 'Makine Parça Ltd.',
    location: 'Depo B-2',
    lastUpdated: new Date().toISOString()
  }
];

const movements = [
  {
    id: '1',
    materialId: '1',
    materialName: 'Mermer Blok A1',
    type: 'in' as const,
    quantity: 50,
    unit: 'ton',
    reason: 'Satın Alma',
    description: 'Yeni sevkiyat',
    date: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];

const machines = [
  {
    id: '1',
    code: 'MCH001',
    name: 'Köprü Kesim Makinesi 1',
    type: 'Kesim',
    model: 'BridgeCut Pro 3000',
    manufacturer: 'StoneTech',
    status: 'active' as const,
    location: 'Üretim Hattı A',
    installDate: '2023-01-15',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    specifications: {
      maxCuttingWidth: '3200mm',
      maxCuttingLength: '2000mm',
      bladeSize: '600mm',
      motorPower: '15kW'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo?: string;
  machineId: string;
  machineName: string;
  estimatedDuration?: number;
  materials?: { materialId: string; quantity: number; unit: string }[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  quantity?: number;
}

const workOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-2024-001',
    title: 'Mermer Plaka Kesimi',
    description: 'Müşteri siparişi için mermer plaka kesimi',
    status: 'PLANNED',
    priority: 'HIGH',
    assignedTo: 'operator',
    machineId: '1',
    machineName: 'Köprü Kesim Makinesi 1',
    estimatedDuration: 240,
    quantity: 5,
    materials: [{ materialId: '1', quantity: 5, unit: 'ton' }],
    createdBy: 'manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    orderNumber: 'WO-2024-002',
    title: 'Granit İşleme',
    description: 'Granit levha işleme',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: 'operator',
    machineId: '2',
    machineName: 'CNC Makinesi',
    estimatedDuration: 180,
    quantity: 3,
    materials: [{ materialId: '2', quantity: 3, unit: 'adet' }],
    createdBy: 'manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    orderNumber: 'WO-2024-003',
    title: 'Mermer Cilalama',
    description: 'Mermer yüzey cilalama işlemi',
    status: 'COMPLETED',
    priority: 'LOW',
    assignedTo: 'operator',
    machineId: '3',
    machineName: 'Cilalama Makinesi',
    estimatedDuration: 120,
    quantity: 2,
    materials: [{ materialId: '3', quantity: 2, unit: 'adet' }],
    createdBy: 'manager',
    createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
     dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
   }
 ];

// Helper functions
const findByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    'your-secret-key',
    { expiresIn: '24h' }
  );
};

const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email },
    'your-refresh-secret-key',
    { expiresIn: '7d' }
  );
};

const verifyToken = (token: string): any => {
  return jwt.verify(token, 'your-secret-key');
};

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = findByEmail(decoded.email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Express app setup
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth routes
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
      return;
    }

    const user = findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is inactive'
      } as ApiResponse);
      return;
    }

    const validPassword = password === 'password123';
    
    if (!validPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
      return;
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const response: LoginResponse = {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    res.json({
      success: true,
      data: response,
      message: 'Login successful'
    } as ApiResponse<LoginResponse>);
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

app.get('/api/auth/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const { id, firstName, lastName, email, role, phone, isActive, createdAt, updatedAt } = req.user;
    
    res.json({
      success: true,
      data: { id, firstName, lastName, email, role, phone, isActive, createdAt, updatedAt },
      message: 'User info retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Get user info error:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Materials routes
app.get('/api/materials', (req: Request, res: Response) => {
  res.json({ success: true, data: materials });
});

app.get('/api/materials/:id', (req: Request, res: Response) => {
  const material = materials.find(m => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ success: false, error: 'Material not found' });
  }
  res.json({ success: true, data: material });
});

app.post('/api/materials', (req: Request, res: Response) => {
  const newMaterial = {
    id: String(materials.length + 1),
    ...req.body,
    lastUpdated: new Date().toISOString()
  };
  materials.push(newMaterial);
  res.json({ success: true, data: newMaterial });
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const index = materials.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Material not found' });
  }
  materials[index] = { ...materials[index], ...req.body, lastUpdated: new Date().toISOString() };
  res.json({ success: true, data: materials[index] });
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const index = materials.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Material not found' });
  }
  materials.splice(index, 1);
  res.json({ success: true, message: 'Material deleted' });
});

// Movements routes
app.get('/api/movements', (req: Request, res: Response) => {
  res.json({ success: true, data: movements });
});

app.post('/api/movements', (req: Request, res: Response) => {
  const newMovement = {
    id: String(movements.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  movements.push(newMovement);
  res.json({ success: true, data: newMovement });
});

// Machines routes
app.get('/api/machines', (req: Request, res: Response) => {
  res.json({ success: true, data: machines });
});

app.get('/api/machines/:id', (req: Request, res: Response) => {
  const machine = machines.find(m => m.id === req.params.id);
  if (!machine) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }
  res.json({ success: true, data: machine });
});

app.post('/api/machines', (req: Request, res: Response) => {
  const newMachine = {
    id: String(machines.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  machines.push(newMachine);
  res.json({ success: true, data: newMachine });
});

app.put('/api/machines/:id', (req: Request, res: Response) => {
  const index = machines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }
  machines[index] = { ...machines[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: machines[index] });
});

// Work Orders routes
app.get('/api/workorders', (req: Request, res: Response) => {
  res.json({ success: true, data: workOrders });
});

app.get('/api/workorders/:id', (req: Request, res: Response) => {
  const workOrder = workOrders.find(w => w.id === req.params.id);
  if (!workOrder) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  res.json({ success: true, data: workOrder });
});

app.post('/api/workorders', (req: Request, res: Response) => {
  const newWorkOrder = {
    id: String(workOrders.length + 1),
    orderNumber: `WO-2024-${String(workOrders.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  workOrders.push(newWorkOrder);
  res.json({ success: true, data: newWorkOrder });
});

app.put('/api/workorders/:id', (req: Request, res: Response) => {
  const index = workOrders.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  workOrders[index] = { ...workOrders[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: workOrders[index] });
});

// Dashboard routes
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const stats = {
    totalMaterials: materials.length,
    lowStockItems: materials.filter(m => m.currentStock <= m.minStock).length,
    totalMachines: machines.length,
    activeMachines: machines.filter(m => m.status === 'active').length,
    pendingWorkOrders: workOrders.filter(w => w.status === 'PLANNED').length,
    completedWorkOrders: workOrders.filter(w => w.status === 'COMPLETED').length
  };
  res.json({ success: true, data: stats });
});

app.get('/api/dashboard/critical-stock', (req: Request, res: Response) => {
  const criticalStock = materials.filter(m => m.currentStock <= m.minStock);
  res.json({ success: true, data: criticalStock });
});

app.get('/api/dashboard/recent-movements', (req: Request, res: Response) => {
  const recentMovements = movements.slice(-10);
  res.json({ success: true, data: recentMovements });
});

app.get('/api/dashboard/work-order-stats', (req: Request, res: Response) => {
  const stats = {
    pending: workOrders.filter(w => w.status === 'PLANNED').length,
    inProgress: workOrders.filter(w => w.status === 'IN_PROGRESS').length,
    completed: workOrders.filter(w => w.status === 'COMPLETED').length,
    cancelled: workOrders.filter(w => w.status === 'CANCELLED').length
  };
  res.json({ success: true, data: stats });
});

// Admin routes
app.post('/api/admin/backup', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({ success: true, message: 'Backup completed successfully' });
  }, 2000);
});

app.post('/api/admin/optimize', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({ success: true, message: 'Database optimization completed' });
  }, 3000);
});

app.post('/api/admin/clear-logs', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({ success: true, message: 'System logs cleared successfully' });
  }, 1000);
});

app.post('/api/admin/restore', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({ success: true, message: 'Database restored successfully' });
  }, 5000);
});

// Reports routes
app.get('/api/reports/inventory', (req: Request, res: Response) => {
  res.json({ success: true, data: materials });
});

app.get('/api/reports/movements', (req: Request, res: Response) => {
  res.json({ success: true, data: movements });
});

app.get('/api/reports/machines', (req: Request, res: Response) => {
  res.json({ success: true, data: machines });
});

app.get('/api/reports/workorders', (req: Request, res: Response) => {
  res.json({ success: true, data: workOrders });
});

// Suppliers route
app.get('/api/suppliers', (req: Request, res: Response) => {
  const suppliers = [
    { id: '1', name: 'Afyon Mermer A.Ş.', contact: 'info@afyonmermer.com' },
    { id: '2', name: 'Makine Parça Ltd.', contact: 'satis@makineparca.com' }
  ];
  res.json({ success: true, data: suppliers });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'ok' });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

// Vercel handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}