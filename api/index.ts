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
    materialCode: 'MRM001',
    materialName: 'Mermer Blok A1',
    type: 'IN' as const,
    quantity: 50,
    unit: 'ton',
    totalPrice: 25000,
    reason: 'Satın Alma',
    description: 'Yeni sevkiyat',
    location: 'Depo A',
    date: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    materialId: '1',
    materialCode: 'MRM001',
    materialName: 'Mermer Blok A1',
    type: 'OUT' as const,
    quantity: 10,
    unit: 'ton',
    totalPrice: 5000,
    reason: 'Satış',
    description: 'Müşteri sevkiyatı',
    location: 'Depo A',
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

// Auth endpoints moved to auth.ts routes

// Materials routes
app.get('/api/materials', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Materials fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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
  try {
    res.json({ success: true, data: movements });
  } catch (error) {
    console.error('Movements fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/movements', (req: Request, res: Response) => {
  const newMovement = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  movements.push(newMovement);
  res.status(201).json({ success: true, data: newMovement });
});

app.put('/api/movements/:id', (req: Request, res: Response) => {
  const index = movements.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Movement not found' });
  }
  movements[index] = { ...movements[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: movements[index] });
});

app.delete('/api/movements/:id', (req: Request, res: Response) => {
  const index = movements.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Movement not found' });
  }
  movements.splice(index, 1);
  res.json({ success: true, message: 'Movement deleted' });
});

// Machines routes
app.get('/api/machines', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: machines });
  } catch (error) {
    console.error('Machines fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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

app.delete('/api/machines/:id', (req: Request, res: Response) => {
  const index = machines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Machine not found' });
  }
  machines.splice(index, 1);
  res.json({ success: true, message: 'Machine deleted' });
});

// Machine BOM routes
app.get('/api/machines/:id/bom', (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    // Return empty BOM for now - this will be populated from database in real implementation
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('BOM fetch error:', error);
    res.status(500).json({ success: false, error: 'BOM yüklenirken hata oluştu' });
  }
});

app.post('/api/machines/:id/bom', (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    
    const { materialId, materialName, materialCode, quantity, unit, notes } = req.body;
    
    if (!materialId || !materialName || !materialCode || !quantity || !unit) {
      return res.status(400).json({ success: false, error: 'Gerekli alanlar eksik' });
    }
    
    const newBOMItem = {
      id: `bom_${Date.now()}`,
      machineId: req.params.id,
      materialId,
      materialName,
      materialCode,
      quantity: parseFloat(quantity),
      unit,
      notes
    };
    
    res.status(201).json({ success: true, data: newBOMItem });
  } catch (error) {
    console.error('BOM item creation error:', error);
    res.status(500).json({ success: false, error: 'BOM öğesi eklenirken hata oluştu' });
  }
});

app.put('/api/machines/:id/bom/:bomId', (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    
    const { quantity, notes } = req.body;
    
    const updatedBOMItem = {
      id: req.params.bomId,
      machineId: req.params.id,
      quantity: quantity ? parseFloat(quantity) : undefined,
      notes
    };
    
    res.json({ success: true, data: updatedBOMItem });
  } catch (error) {
    console.error('BOM item update error:', error);
    res.status(500).json({ success: false, error: 'BOM öğesi güncellenirken hata oluştu' });
  }
});

app.delete('/api/machines/:id/bom/:bomId', (req: Request, res: Response) => {
  try {
    const machine = machines.find(m => m.id === req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    
    res.json({ success: true, message: 'BOM öğesi başarıyla silindi' });
  } catch (error) {
    console.error('BOM item deletion error:', error);
    res.status(500).json({ success: false, error: 'BOM öğesi silinirken hata oluştu' });
  }
});

// Work Orders routes
app.get('/api/workorders', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: workOrders });
  } catch (error) {
    console.error('Work orders fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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

app.delete('/api/workorders/:id', (req: Request, res: Response) => {
  const index = workOrders.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  workOrders.splice(index, 1);
  res.json({ success: true, message: 'Work order deleted' });
});

app.patch('/api/workorders/:id/start', (req: Request, res: Response) => {
  const index = workOrders.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  if (workOrders[index].status !== 'PLANNED') {
    return res.status(400).json({ success: false, error: 'Work order cannot be started' });
  }
  workOrders[index] = { ...workOrders[index], status: 'IN_PROGRESS', updatedAt: new Date().toISOString() };
  res.json({ success: true, data: workOrders[index] });
});

app.patch('/api/workorders/:id/complete', (req: Request, res: Response) => {
  const index = workOrders.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  if (workOrders[index].status !== 'IN_PROGRESS') {
    return res.status(400).json({ success: false, error: 'Work order cannot be completed' });
  }
  workOrders[index] = { ...workOrders[index], status: 'COMPLETED', updatedAt: new Date().toISOString() };
  res.json({ success: true, data: workOrders[index] });
});

app.patch('/api/workorders/:id/cancel', (req: Request, res: Response) => {
  const index = workOrders.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Work order not found' });
  }
  if (workOrders[index].status === 'COMPLETED') {
    return res.status(400).json({ success: false, error: 'Completed work order cannot be cancelled' });
  }
  workOrders[index] = { ...workOrders[index], status: 'CANCELLED', updatedAt: new Date().toISOString() };
  res.json({ success: true, data: workOrders[index] });
});

// Dashboard routes
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      materials: {
        total: materials.length,
        lowStock: materials.filter(m => m.currentStock <= m.minStock).length,
        outOfStock: materials.filter(m => m.currentStock === 0).length
      },
      machines: {
        total: machines.length,
        active: machines.filter(m => m.status === 'active').length,
        maintenance: machines.filter(m => m.status === 'active').length, // Placeholder for maintenance
        inactive: machines.filter(m => m.status === 'active').length // Placeholder for inactive
      },
      movements: {
        monthlyInbound: movements.filter(m => m.type === 'IN' && new Date(m.createdAt).getMonth() === new Date().getMonth()).length,
        monthlyOutbound: movements.filter(m => m.type === 'OUT' && new Date(m.createdAt).getMonth() === new Date().getMonth()).length,
        monthlyNet: movements.filter(m => new Date(m.createdAt).getMonth() === new Date().getMonth()).reduce((sum, m) => sum + (m.type === 'IN' ? m.quantity : -m.quantity), 0),
        totalMovements: movements.length
      }
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/dashboard/critical-stock', (req: Request, res: Response) => {
  try {
    const criticalMaterials = materials
      .filter(material => material.currentStock <= material.minStock)
      .map(material => {
        const shortage = material.minStock - material.currentStock;
        let severity: 'critical' | 'high' | 'medium' = 'medium';
        
        if (material.currentStock === 0) {
          severity = 'critical';
        } else if (shortage >= material.minStock * 0.5) {
          severity = 'high';
        }
        
        return {
          id: material.id,
          code: material.code,
          name: material.name,
          currentStock: material.currentStock,
          minStockLevel: material.minStock,
          unit: material.unit,
          category: material.category,
          location: material.location,
          severity
        };
      });
    
    res.json(criticalMaterials);
  } catch (error) {
    console.error('Error fetching critical stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard/recent-movements', (req: Request, res: Response) => {
  try {
    const recentMovements = movements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(movement => ({
        id: movement.id,
        materialCode: movement.materialCode,
        materialName: movement.materialName,
        type: movement.type,
        quantity: movement.quantity,
        unit: movement.unit,
        reason: movement.reason,
        location: movement.location,
        createdAt: movement.createdAt
      }));
    
    res.json(recentMovements);
  } catch (error) {
    console.error('Error fetching recent movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard/work-order-stats', (req: Request, res: Response) => {
  try {
    const now = new Date();
    const overdueWorkOrders = workOrders.filter(w => 
      w.status !== 'COMPLETED' && 
      w.status !== 'CANCELLED' && 
      new Date(w.dueDate) < now
    ).length;
    
    const stats = {
      total: workOrders.length,
      pending: workOrders.filter(w => w.status === 'PLANNED').length,
      inProgress: workOrders.filter(w => w.status === 'IN_PROGRESS').length,
      completed: workOrders.filter(w => w.status === 'COMPLETED').length,
      overdue: overdueWorkOrders
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Work order stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/dashboard/category-distribution', (req: Request, res: Response) => {
  const categoryStats = {
    'Mermer': materials.filter(m => m.category === 'Mermer').length,
    'Granit': materials.filter(m => m.category === 'Granit').length,
    'Traverten': materials.filter(m => m.category === 'Traverten').length,
    'Oniks': materials.filter(m => m.category === 'Oniks').length,
    'Diğer': materials.filter(m => !['Mermer', 'Granit', 'Traverten', 'Oniks'].includes(m.category)).length
  };
  
  const chartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / materials.length) * 100)
  }));
  
  res.json({ success: true, data: chartData });
});

app.get('/api/dashboard/stock-trends', (req: Request, res: Response) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const trendData = last7Days.map((date, index) => ({
    date,
    inbound: Math.floor(Math.random() * 50) + 10,
    outbound: Math.floor(Math.random() * 40) + 5,
    total: materials.reduce((sum, m) => sum + m.currentStock, 0) + (index * 10)
  }));
  
  res.json({ success: true, data: trendData });
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

// Movements routes
app.get('/api/movements', (req: Request, res: Response) => {
  try {
    const { search, type, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    let filteredMovements = [...movements];
    
    // Apply filters
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredMovements = filteredMovements.filter(m => 
        m.materialName?.toLowerCase().includes(searchTerm) ||
        m.materialCode?.toLowerCase().includes(searchTerm) ||
        m.reason?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (type) {
      filteredMovements = filteredMovements.filter(m => m.type === type);
    }
    
    if (dateFrom) {
      filteredMovements = filteredMovements.filter(m => 
        new Date(m.createdAt) >= new Date(dateFrom.toString())
      );
    }
    
    if (dateTo) {
      filteredMovements = filteredMovements.filter(m => 
        new Date(m.createdAt) <= new Date(dateTo.toString())
      );
    }
    
    // Sort by creation date (newest first)
    filteredMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        data: paginatedMovements,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredMovements.length,
          totalPages: Math.ceil(filteredMovements.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Movements fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Hareketler yüklenirken hata oluştu'
    });
  }
});

// Suppliers routes
app.get('/api/suppliers', (req: Request, res: Response) => {
  const suppliers = [
    { id: '1', name: 'Afyon Mermer A.Ş.', contact: 'info@afyonmermer.com' },
    { id: '2', name: 'Makine Parça Ltd.', contact: 'satis@makineparca.com' }
  ];
  res.json({ success: true, data: suppliers });
});

// Admin suppliers route (used by MaterialForm and MaterialEdit)
app.get('/api/admin/suppliers', (req: Request, res: Response) => {
  const suppliers = [
    { id: '1', name: 'Afyon Mermer A.Ş.', contact: 'info@afyonmermer.com', email: 'info@afyonmermer.com', phone: '+90 272 123 4567', address: 'Afyon Merkez', status: 'active' },
    { id: '2', name: 'Makine Parça Ltd.', contact: 'satis@makineparca.com', email: 'satis@makineparca.com', phone: '+90 212 987 6543', address: 'İstanbul Sanayi', status: 'active' },
    { id: '3', name: 'Granit Dünyası', contact: 'info@granitdunyasi.com', email: 'info@granitdunyasi.com', phone: '+90 232 555 1234', address: 'İzmir Kemalpaşa', status: 'active' }
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