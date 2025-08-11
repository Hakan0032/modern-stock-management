// Mock data store for development
import type {
  User,
  Material,
  MaterialMovement,
  Machine,
  BOMItem,
  WorkOrder,
  Supplier,
  UserRole,
  MaterialCategory,
  MaterialUnit,
  MovementType,
  WorkOrderStatus
} from '../../shared/types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@mermermakinesi.com',
    password: 'hashed_password_1',
    firstName: 'Sistem',
    lastName: 'Yöneticisi',
    role: 'admin',
    department: 'IT',
    phone: '+90 555 123 4567',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'depo_sorumlusu',
    email: 'depo@mermermakinesi.com',
    password: 'hashed_password_2',
    firstName: 'Depo',
    lastName: 'Sorumlusu',
    role: 'operator',
    department: 'Depo',
    phone: '+90 555 123 4568',
    isActive: true,
    lastLogin: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    username: 'teknisyen_ali',
    email: 'teknisyen@mermermakinesi.com',
    password: 'hashed_password_3',
    firstName: 'Ali',
    lastName: 'Teknisyen',
    role: 'operator',
    department: 'Teknik',
    phone: '+90 555 123 4569',
    isActive: true,
    lastLogin: '2024-01-13T09:15:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    username: 'planlama_uzmani',
    email: 'planlama@mermermakinesi.com',
    password: 'hashed_password_4',
    firstName: 'Planlama',
    lastName: 'Uzmanı',
    role: 'planner',
    department: 'Planlama',
    phone: '+90 555 123 4570',
    isActive: true,
    lastLogin: '2024-01-12T16:45:00Z',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  }
];

// Mock Suppliers
export const suppliers: Supplier[] = [
  {
    id: 1,
    name: 'Elektrik Malzemeleri A.Ş.',
    contactPerson: 'Mehmet Yılmaz',
    email: 'info@elektrikmalzeme.com',
    phone: '+90 212 555 0001',
    address: 'İstanbul, Türkiye'
  },
  {
    id: 2,
    name: 'Pano Sistemleri Ltd.',
    contactPerson: 'Ayşe Kaya',
    email: 'satis@panosistem.com',
    phone: '+90 312 555 0002',
    address: 'Ankara, Türkiye'
  },
  {
    id: 3,
    name: 'Mekanik Parça Tedarik',
    contactPerson: 'Fatih Özkan',
    email: 'siparis@mekanikparca.com',
    phone: '+90 232 555 0003',
    address: 'İzmir, Türkiye'
  }
];

// Mock Materials
export const materials: Material[] = [
  {
    id: '1',
    code: 'ELK001',
    name: 'Sigorta 16A',
    description: 'Elektrik panoları için 16A sigorta',
    category: 'electrical',
    unit: 'piece',
    currentStock: 100,
    minStockLevel: 20,
    maxStockLevel: 200,
    unitPrice: 5.50,
    supplier: 'Elektrik Malzemeleri A.Ş.',
    location: 'A-01-01',
    barcode: '1234567890123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'ELK002',
    name: 'Kontaktör 25A',
    description: 'Motor kontrol için 25A kontaktör',
    category: 'Elektrik',
    unit: 'piece',
    currentStock: 15,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 45.00,
    supplier: 'Elektrik Malzemeleri A.Ş.',
    location: 'A-01-02',
    barcode: '1234567890124',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    code: 'PAN001',
    name: 'Pano Kapısı 400x600',
    description: 'Elektrik panosu kapısı 400x600mm',
    category: 'panel',
    unit: 'Adet',
    currentStock: 25,
    minStockLevel: 5,
    maxStockLevel: 30,
    unitPrice: 120.00,
    supplier: 'Pano Sistemleri Ltd.',
    location: 'B-01-01',
    barcode: '1234567890125',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    code: 'MEK001',
    name: 'Vida M8x20',
    description: 'Altı köşe başlı vida M8x20mm',
    category: 'mechanical',
    unit: 'Adet',
    currentStock: 500,
    minStockLevel: 100,
    maxStockLevel: 1000,
    unitPrice: 0.25,
    supplier: 'Mekanik Parça Tedarik',
    location: 'C-01-01',
    barcode: '1234567890126',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    code: 'ELK003',
    name: 'Kablo 2.5mm²',
    description: 'Elektrik kablosu 2.5mm² kesit',
    category: 'electrical',
    unit: 'meter',
    currentStock: 8,
    minStockLevel: 50,
    maxStockLevel: 500,
    unitPrice: 3.20,
    supplier: 'Elektrik Malzemeleri A.Ş.',
    location: 'A-02-01',
    barcode: '1234567890127',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock Machines
export const machines: Machine[] = [
  {
    id: '1',
    code: 'SM-2000',
    name: 'Silim Makinesi SM-2000',
    category: 'Silim',
    model: 'SM-2000',
    manufacturer: 'Mermer Makineleri A.Ş.',
    year: 2023,
    status: 'active',
    location: 'Üretim Sahası A',
    specifications: 'Mermer silim işlemleri için kullanılan makine - v2.1',
    maintenanceSchedule: 'Aylık',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'TM-1500',
    name: 'Tırmık Makinesi TM-1500',
    category: 'Tırmık',
    model: 'TM-1500',
    manufacturer: 'Mermer Makineleri A.Ş.',
    year: 2022,
    status: 'active',
    location: 'Üretim Sahası B',
    specifications: 'Mermer yüzey tırmıklama makinesi - v1.8',
    maintenanceSchedule: 'Aylık',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    code: 'YM-3000',
    name: 'Yarma Makinesi YM-3000',
    category: 'Yarma',
    model: 'YM-3000',
    manufacturer: 'Mermer Makineleri A.Ş.',
    year: 2024,
    status: 'active',
    location: 'Üretim Sahası C',
    specifications: 'Mermer yarma ve kesim makinesi - v3.0',
    maintenanceSchedule: 'Aylık',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock BOM Items
export const bomItems: BOMItem[] = [
  // Silim Makinesi BOM
  { id: '1', machineId: '1', materialId: '1', materialCode: 'ELK001', materialName: 'Sigorta 16A', quantity: 4, unit: 'piece', unitPrice: 5.50, notes: 'Ana güç sigortası' },
  { id: '2', machineId: '1', materialId: '2', materialCode: 'ELK002', materialName: 'Kontaktör 25A', quantity: 2, unit: 'piece', unitPrice: 45.00, notes: 'Motor kontaktörü' },
  { id: '3', machineId: '1', materialId: '3', materialCode: 'PAN001', materialName: 'Pano Kapısı 400x600', quantity: 1, unit: 'piece', unitPrice: 120.00, notes: 'Elektrik panosu' },
  { id: '4', machineId: '1', materialId: '4', materialCode: 'MEK001', materialName: 'Vida M8x20', quantity: 20, unit: 'piece', unitPrice: 0.25, notes: 'Montaj vidaları' },
  { id: '5', machineId: '1', materialId: '5', materialCode: 'ELK003', materialName: 'Kablo 2.5mm²', quantity: 15, unit: 'meter', unitPrice: 3.20, notes: 'Güç kablosu' },
  
  // Tırmık Makinesi BOM
  { id: '6', machineId: '2', materialId: '1', materialCode: 'ELK001', materialName: 'Sigorta 16A', quantity: 2, unit: 'piece', unitPrice: 5.50, notes: 'Güç sigortası' },
  { id: '7', machineId: '2', materialId: '2', materialCode: 'ELK002', materialName: 'Kontaktör 25A', quantity: 1, unit: 'piece', unitPrice: 45.00, notes: 'Kontaktör' },
  { id: '8', machineId: '2', materialId: '4', materialCode: 'MEK001', materialName: 'Vida M8x20', quantity: 15, unit: 'piece', unitPrice: 0.25, notes: 'Montaj vidaları' },
  { id: '9', machineId: '2', materialId: '5', materialCode: 'ELK003', materialName: 'Kablo 2.5mm²', quantity: 10, unit: 'meter', unitPrice: 3.20, notes: 'Kablo bağlantısı' },
  
  // Yarma Makinesi BOM
  { id: '10', machineId: '3', materialId: '1', materialCode: 'ELK001', materialName: 'Sigorta 16A', quantity: 6, unit: 'piece', unitPrice: 5.50, notes: 'Ana güç sigortası' },
  { id: '11', machineId: '3', materialId: '2', materialCode: 'ELK002', materialName: 'Kontaktör 25A', quantity: 3, unit: 'piece', unitPrice: 45.00, notes: 'Motor kontaktörü' },
  { id: '12', machineId: '3', materialId: '3', materialCode: 'PAN001', materialName: 'Pano Kapısı 400x600', quantity: 2, unit: 'piece', unitPrice: 120.00, notes: 'Elektrik panosu' },
  { id: '13', machineId: '3', materialId: '4', materialCode: 'MEK001', materialName: 'Vida M8x20', quantity: 30, unit: 'piece', unitPrice: 0.25, notes: 'Montaj vidaları' },
  { id: '14', machineId: '3', materialId: '5', materialCode: 'ELK003', materialName: 'Kablo 2.5mm²', quantity: 25, unit: 'meter', unitPrice: 3.20, notes: 'Güç kablosu' }
];

// Mock Work Orders
export const workOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-2024-001',
    title: 'Silim Makinesi Üretimi',
    description: 'ABC Mermer Ltd. için 2 adet silim makinesi üretimi',
    machineId: '1',
    machineName: 'Silim Makinesi SM-2000',
    quantity: 2,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    plannedStartDate: '2024-01-15T08:00:00Z',
    plannedEndDate: '2024-01-25T17:00:00Z',
    actualStartDate: '2024-01-15T08:30:00Z',
    customerName: 'ABC Mermer Ltd.',
    customerContact: 'Ahmet Yılmaz',
    assignedTo: 'Mehmet Demir',
    estimatedHours: 80,
    actualHours: 45,
    notes: 'Müşteri özel renk talebi var',
    createdBy: '2',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    orderNumber: 'WO-2024-002',
    title: 'Tırmık Makinesi Bakımı',
    description: 'XYZ Taş İşleri için tırmık makinesi periyodik bakımı',
    machineId: '2',
    machineName: 'Tırmık Makinesi TM-1500',
    quantity: 1,
    status: 'PLANNED',
    priority: 'MEDIUM',
    plannedStartDate: '2024-01-20T09:00:00Z',
    plannedEndDate: '2024-01-28T16:00:00Z',
    customerName: 'XYZ Taş İşleri',
    customerContact: 'Fatma Kaya',
    assignedTo: 'Ali Veli',
    estimatedHours: 40,
    notes: 'Yedek parça tedariki bekleniyor',
    createdBy: '2',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: '3',
    orderNumber: 'WO-2024-003',
    title: 'Yarma Makinesi Kurulumu',
    description: 'DEF Mermer A.Ş. için yeni yarma makinesi kurulumu',
    machineId: '3',
    machineName: 'Yarma Makinesi YM-3000',
    quantity: 1,
    status: 'PLANNED',
    priority: 'LOW',
    plannedStartDate: '2024-02-01T08:00:00Z',
    plannedEndDate: '2024-02-10T17:00:00Z',
    customerName: 'DEF Mermer A.Ş.',
    customerContact: 'Hasan Özkan',
    assignedTo: 'Ayşe Yıldız',
    estimatedHours: 60,
    notes: 'Saha hazırlığı tamamlanmalı',
    createdBy: '1',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z'
  }
];

// Mock Material Movements
export const materialMovements: MaterialMovement[] = [
  {
    id: '1',
    materialId: '1',
    materialCode: 'ELK001',
    materialName: 'Sigorta 16A',
    type: 'IN',
    quantity: 50,
    unit: 'Adet',
    unitPrice: 5.50,
    totalPrice: 275.00,
    reason: 'Satın Alma',
    reference: 'F2024001',
    location: 'A-01-01',
    performedBy: 'Ayşe Yılmaz',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    materialId: '2',
    materialCode: 'ELK002',
    materialName: 'Kontaktör 25A',
    type: 'OUT',
    quantity: 4,
    unit: 'Adet',
    unitPrice: 45.00,
    totalPrice: 180.00,
    reason: 'Üretim',
    reference: 'WO-2024-001',
    location: 'A-01-02',
    performedBy: 'Mehmet Demir',
    createdAt: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    materialId: '5',
    materialCode: 'ELK003',
    materialName: 'Kablo 2.5mm²',
    type: 'OUT',
    quantity: 30,
    unit: 'meter',
    unitPrice: 3.20,
    totalPrice: 96.00,
    reason: 'Üretim',
    reference: 'WO-2024-001',
    location: 'A-02-01',
    performedBy: 'Mehmet Demir',
    createdAt: '2024-01-16T15:00:00Z'
  },
  {
    id: '4',
    materialId: '3',
    materialCode: 'PAN001',
    materialName: 'Pano Kapısı 400x600',
    type: 'IN',
    quantity: 10,
    unit: 'Adet',
    unitPrice: 120.00,
    totalPrice: 1200.00,
    reason: 'Satın Alma',
    reference: 'F2024002',
    location: 'B-01-01',
    performedBy: 'Ayşe Yılmaz',
    createdAt: '2024-01-17T10:15:00Z'
  },
  {
    id: '5',
    materialId: '4',
    materialCode: 'MEK001',
    materialName: 'Vida M8x20',
    type: 'OUT',
    quantity: 40,
    unit: 'Adet',
    unitPrice: 0.25,
    totalPrice: 10.00,
    reason: 'Üretim',
    reference: 'WO-2024-001',
    location: 'C-01-01',
    performedBy: 'Mehmet Demir',
    createdAt: '2024-01-18T11:20:00Z'
  }
];

// Helper functions for data manipulation
export const getNextId = (): string => {
  return Date.now().toString();
};

export const findById = <T extends { id: string }>(array: T[], id: string): T | undefined => {
  return array.find(item => item.id === id);
};

export const findByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const getCriticalStocks = () => {
  return materials.filter(material => material.currentStock <= material.minStockLevel);
};

export const getRecentMovements = (limit: number = 10) => {
  return materialMovements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const addMaterialMovement = (movement: Omit<MaterialMovement, 'id' | 'createdAt'>): MaterialMovement => {
  const newMovement: MaterialMovement = {
    ...movement,
    id: getNextId(),
    createdAt: new Date().toISOString()
  };
  materialMovements.push(newMovement);
  return newMovement;
};

export const updateMaterialStock = (materialId: string, quantity: number, type: string): boolean => {
  const material = findById(materials, materialId);
  if (!material) return false;
  
  if (type === 'In') {
    material.currentStock += quantity;
  } else if (type === 'Out') {
    if (material.currentStock >= quantity) {
      material.currentStock -= quantity;
    } else {
      return false; // Insufficient stock
    }
  }
  
  material.updatedAt = new Date().toISOString();
  return true;
};