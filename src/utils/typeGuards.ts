/**
 * Type guards to ensure data safety and prevent React error #31
 * These guards validate data types before rendering to prevent object rendering issues
 */

import { Material, MaterialMovement, Machine, WorkOrder } from '../types';

// Basic type guards
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isValidDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

export const isValidDateString = (value: any): value is string => {
  if (!isString(value)) return false;
  const date = new Date(value);
  return isValidDate(date);
};

// Material type guards
export const isMaterial = (value: any): value is Material => {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.code) &&
    isString(value.name) &&
    isString(value.category) &&
    isString(value.unit) &&
    isNumber(value.currentStock) &&
    isNumber(value.minStockLevel)
  );
};

export const isMaterialArray = (value: any): value is Material[] => {
  if (!isArray(value)) return false;
  return value.every(item => isMaterial(item));
};

// Material Movement type guards
export const isMaterialMovement = (value: any): value is MaterialMovement => {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.materialId) &&
    isString(value.type) &&
    isNumber(value.quantity) &&
    (value.type === 'IN' || value.type === 'OUT')
  );
};

export const isMaterialMovementArray = (value: any): value is MaterialMovement[] => {
  if (!isArray(value)) return false;
  return value.every(item => isMaterialMovement(item));
};

// Machine type guards
export const isMachine = (value: any): value is Machine => {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.code) &&
    isString(value.name) &&
    isString(value.status)
  );
};

export const isMachineArray = (value: any): value is Machine[] => {
  if (!isArray(value)) return false;
  return value.every(item => isMachine(item));
};

// API Response type guards
export const isApiResponse = (value: any): value is { success: boolean; data: any; error?: string } => {
  if (!isObject(value)) return false;
  
  return (
    isBoolean(value.success) &&
    'data' in value
  );
};

// Safe data extraction with type validation
export const extractSafeMaterials = (apiResponse: any): Material[] => {
  try {
    if (!isApiResponse(apiResponse)) {
      console.warn('Invalid API response structure for materials');
      return [];
    }
    
    if (!apiResponse.success) {
      console.warn('API response indicates failure:', apiResponse.error);
      return [];
    }
    
    const data = apiResponse.data;
    
    // Handle different response structures
    let materials: any;
    if (isArray(data)) {
      materials = data;
    } else if (isObject(data) && isArray(data.data)) {
      materials = data.data;
    } else if (isObject(data) && isArray(data.materials)) {
      materials = data.materials;
    } else {
      console.warn('Unexpected materials data structure:', data);
      return [];
    }
    
    // Validate each material
    const validMaterials = materials.filter((item: any) => {
      if (!isMaterial(item)) {
        console.warn('Invalid material object:', item);
        return false;
      }
      return true;
    });
    
    return validMaterials;
  } catch (error) {
    console.error('Error extracting safe materials:', error);
    return [];
  }
};

export const extractSafeMovements = (apiResponse: any): MaterialMovement[] => {
  try {
    if (!isApiResponse(apiResponse)) {
      console.warn('Invalid API response structure for movements');
      return [];
    }
    
    if (!apiResponse.success) {
      console.warn('API response indicates failure:', apiResponse.error);
      return [];
    }
    
    const data = apiResponse.data;
    
    // Handle different response structures
    let movements: any;
    if (isArray(data)) {
      movements = data;
    } else if (isObject(data) && isArray(data.data)) {
      movements = data.data;
    } else if (isObject(data) && isArray(data.movements)) {
      movements = data.movements;
    } else {
      console.warn('Unexpected movements data structure:', data);
      return [];
    }
    
    // Validate each movement
    const validMovements = movements.filter((item: any) => {
      if (!isMaterialMovement(item)) {
        console.warn('Invalid movement object:', item);
        return false;
      }
      return true;
    });
    
    return validMovements;
  } catch (error) {
    console.error('Error extracting safe movements:', error);
    return [];
  }
};

export const extractSafeMachines = (apiResponse: any): Machine[] => {
  try {
    if (!isApiResponse(apiResponse)) {
      console.warn('Invalid API response structure for machines');
      return [];
    }
    
    if (!apiResponse.success) {
      console.warn('API response indicates failure:', apiResponse.error);
      return [];
    }
    
    const data = apiResponse.data;
    
    // Handle different response structures
    let machines: any;
    if (isArray(data)) {
      machines = data;
    } else if (isObject(data) && isArray(data.data)) {
      machines = data.data;
    } else if (isObject(data) && isArray(data.machines)) {
      machines = data.machines;
    } else {
      console.warn('Unexpected machines data structure:', data);
      return [];
    }
    
    // Validate each machine
    const validMachines = machines.filter((item: any) => {
      if (!isMachine(item)) {
        console.warn('Invalid machine object:', item);
        return false;
      }
      return true;
    });
    
    return validMachines;
  } catch (error) {
    console.error('Error extracting safe machines:', error);
    return [];
  }
};

// Generic safe data extractor
export const extractSafeData = <T>(apiResponse: any, validator: (item: any) => item is T): T[] => {
  try {
    if (!isApiResponse(apiResponse)) {
      console.warn('Invalid API response structure');
      return [];
    }
    
    if (!apiResponse.success) {
      console.warn('API response indicates failure:', apiResponse.error);
      return [];
    }
    
    const data = apiResponse.data;
    
    // Handle different response structures
    let items: any;
    if (isArray(data)) {
      items = data;
    } else if (isObject(data) && isArray(data.data)) {
      items = data.data;
    } else {
      console.warn('Unexpected data structure:', data);
      return [];
    }
    
    // Validate each item
    const validItems = items.filter((item: any) => {
      if (!validator(item)) {
        console.warn('Invalid item object:', item);
        return false;
      }
      return true;
    });
    
    return validItems;
  } catch (error) {
    console.error('Error extracting safe data:', error);
    return [];
  }
};

export default {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isValidDate,
  isValidDateString,
  isMaterial,
  isMaterialArray,
  isMaterialMovement,
  isMaterialMovementArray,
  isMachine,
  isMachineArray,
  isApiResponse,
  extractSafeMaterials,
  extractSafeMovements,
  extractSafeMachines,
  extractSafeData
};