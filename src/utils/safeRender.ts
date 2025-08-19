/**
 * Safe rendering utilities to prevent React error #31
 * This utility ensures that objects are never accidentally rendered as React children
 */

// Type guard to check if a value is a primitive that can be safely rendered
export const isSafeToRender = (value: any): value is string | number | boolean | null | undefined => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  );
};

// Safe text renderer that converts any value to a safe string
export const safeText = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => safeText(item)).join(', ');
    }
    
    // Handle plain objects - convert to JSON string
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('Failed to stringify object for safe rendering:', error);
      return '[Object]';
    }
  }
  
  // Fallback for any other type
  return String(value);
};

// Safe number renderer
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
};

// Safe array renderer
export const safeArray = <T>(value: any): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  
  return [];
};

// Safe object property access
export const safeProp = <T>(obj: any, key: string, defaultValue?: T): T | undefined => {
  if (obj && typeof obj === 'object' && key in obj) {
    return obj[key];
  }
  
  return defaultValue;
};

// Validate that a value is safe for React rendering
export const validateForReactRender = (value: any, context: string = 'unknown'): void => {
  if (value !== null && value !== undefined && typeof value === 'object' && !React.isValidElement(value)) {
    console.error(`⚠️ Potential React error #31 detected in ${context}:`, {
      value,
      type: typeof value,
      isArray: Array.isArray(value),
      isDate: value instanceof Date,
      keys: Object.keys(value || {})
    });
    
    throw new Error(`Invalid React child detected in ${context}. Objects cannot be rendered as React children.`);
  }
};

// Safe component wrapper that validates all props
export const withSafeProps = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string = 'Component'
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // Validate all props before rendering
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith('children') || key === 'children') {
        // Special handling for children prop
        if (value !== null && value !== undefined && typeof value === 'object' && !React.isValidElement(value) && !Array.isArray(value)) {
          console.error(`⚠️ Invalid children prop in ${componentName}:`, value);
        }
      }
    });
    
    return React.createElement(Component, props as any);
  });
};

// React import for type checking
import React from 'react';

export default {
  isSafeToRender,
  safeText,
  safeNumber,
  safeArray,
  safeProp,
  validateForReactRender,
  withSafeProps
};