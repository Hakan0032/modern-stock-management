// Shared types between frontend and backend

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'planner' | 'operator' | 'viewer';
  department: string | null;
  phone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleStats: {
    admin: number;
    manager: number;
    planner: number;
    operator: number;
    viewer: number;
  };
  recentRegistrations: number;
  recentLogins: number;
}

export type UserRole = 'admin' | 'manager' | 'planner' | 'operator' | 'viewer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

// Material types
export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  supplier?: string;
  location: string;
  barcode?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaterialCategory = 'electrical' | 'panel' | 'mechanical' | 'other';
export type MaterialUnit = 'piece' | 'meter' | 'kilogram' | 'liter';

// Material Movement types
export interface MaterialMovement {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  reason: string;
  reference?: string;
  location: string;
  performedBy: string;
  createdAt: string;
}

export type MovementType = 'In' | 'Out' | 'Return' | 'Adjustment';

export interface CreateMovementRequest {
  materialId: number;
  type: MovementType;
  quantity: number;
  workOrderId?: number;
  note?: string;
}

// Machine types
export interface Machine {
  id: string;
  code: string;
  name: string;
  category: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  status: 'active' | 'maintenance' | 'inactive';
  location?: string;
  specifications?: string;
  maintenanceSchedule?: string;
  createdAt: string;
  updatedAt: string;
}

// BOM types
export interface BOMItem {
  id: string;
  machineId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes?: string;
}

export interface BOMItemWithMaterial extends BOMItem {
  material: Material;
}

// Work Order types
export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  machineId: string;
  machineName: string;
  quantity: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  customerName?: string;
  customerContact?: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateWorkOrderRequest {
  machineId: number;
  quantity: number;
  customerName?: string;
  startDate?: Date;
  endDate?: Date;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Dashboard types
export interface DashboardStats {
  materials: {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  workOrders: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  machines: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  };
  movements: {
    monthlyInbound: number;
    monthlyOutbound: number;
    monthlyNet: number;
    totalMovements: number;
  };
}

export interface CriticalStockAlert {
  id: string;
  code: string;
  name: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  category: string;
  location: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface RecentMovement {
  id: string;
  materialCode: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit: string;
  totalPrice: number;
  reason: string;
  location: string;
  createdAt: string;
}

export interface UpcomingWorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  machineName: string;
  status: string;
  priority: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
}

export interface StockMovementTrend {
  month: string;
  inbound: number;
  outbound: number;
  net: number;
}

export interface WorkOrderCompletionTrend {
  month: string;
  completed: number;
  cancelled: number;
  total: number;
}

export interface TopConsumedMaterial {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  totalQuantity: number;
  totalValue: number;
  movementCount: number;
}

export interface CriticalStock {
  material: Material;
  currentStock: number;
  minLevel: number;
  shortage: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface MaterialFilter {
  category?: MaterialCategory;
  supplierId?: number;
  lowStock?: boolean;
  search?: string;
}

export interface MovementFilter {
  materialId?: number;
  type?: MovementType;
  userId?: number;
  workOrderId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface WorkOrderFilter {
  status?: WorkOrderStatus;
  machineId?: number;
  startDate?: Date;
  endDate?: Date;
}

// System Settings types
export interface SystemSettings {
  general: {
    companyName: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  inventory: {
    autoReorderEnabled: boolean;
    lowStockThreshold: number;
    criticalStockThreshold: number;
    defaultLocation: string;
    enableBarcodeScanning: boolean;
  };
  workOrders: {
    autoNumbering: boolean;
    numberPrefix: string;
    requireApproval: boolean;
    autoMaterialConsumption: boolean;
    defaultPriority: string;
  };
  notifications: {
    emailNotifications: boolean;
    lowStockAlerts: boolean;
    workOrderAlerts: boolean;
    systemMaintenanceAlerts: boolean;
    reportScheduling: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
    passwordChangeInterval: number;
    enableTwoFactor: boolean;
    maxLoginAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: string;
    retentionPeriod: number;
    lastBackup: string;
  };
}

// System Log types
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  error?: string;
}

// Report types
export interface StockReport {
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    generatedAt: string;
  };
  materials: Array<{
    code: string;
    name: string;
    category: string;
    location: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    unit: string;
    unitPrice: number;
    totalValue: number;
    stockStatus: string;
    lastUpdated: string;
  }>;
}

export interface MovementReport {
  summary: {
    totalMovements: number;
    totalInbound: number;
    totalOutbound: number;
    netMovement: number;
    period: {
      startDate: string;
      endDate: string;
    };
    generatedAt: string;
  };
  movements: Array<{
    id: string;
    materialCode: string;
    materialName: string;
    type: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    reason: string;
    reference?: string;
    location: string;
    performedBy: string;
    createdAt: string;
  }>;
}

export interface WorkOrderReport {
  summary: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    pendingWorkOrders: number;
    inProgressWorkOrders: number;
    cancelledWorkOrders: number;
    completionRate: number;
    avgCompletionTime: number;
    period: {
      startDate: string;
      endDate: string;
    };
    generatedAt: string;
  };
  workOrders: Array<{
    orderNumber: string;
    title: string;
    machineName: string;
    status: string;
    priority: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    createdAt: string;
  }>;
}

export interface MachineUtilizationReport {
  summary: {
    totalMachines: number;
    activeMachines: number;
    totalWorkOrders: number;
    completedWorkOrders: number;
    period: {
      startDate: string;
      endDate: string;
    };
    generatedAt: string;
  };
  machines: Array<{
    machineId: string;
    machineName: string;
    machineCode: string;
    category: string;
    status: string;
    totalWorkOrders: number;
    completedWorkOrders: number;
    totalHours: number;
    avgCompletionTime: number;
    utilizationRate: number;
  }>;
}

export interface BOMCostAnalysisReport {
  summary: {
    totalMachines: number;
    totalBOMCost: number;
    avgBOMCost: number;
    generatedAt: string;
  };
  machines: Array<{
    machineId: string;
    machineCode: string;
    machineName: string;
    category: string;
    materialCount: number;
    totalCost: number;
    avgMaterialCost: number;
    bomItems: Array<{
      materialCode: string;
      materialName: string;
      quantity: number;
      unit: string;
    unitPrice: number;
      totalCost: number;
    }>;
  }>;
}