import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { User, UserRole } from '../../shared/types';
import { findById, users } from '../data/mockData';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'mermer-makinesi-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

// Generate refresh token
export const generateRefreshToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token or simple token
export const verifyToken = (token: string): JWTPayload => {
  try {
    // First try JWT verification
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    // If JWT fails, try simple base64 token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.id && decoded.email && decoded.role) {
        return {
          userId: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
      }
      throw new Error('Invalid simple token format');
    } catch (simpleError) {
      throw new Error('Invalid token format');
    }
  }
};

// Authentication middleware - simplified for development
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth Middleware: Token kontrolü başlatıldı');
  console.log('🔐 Auth Middleware: Auth header:', authHeader);
  console.log('🔐 Auth Middleware: Extracted token:', token ? 'Token var' : 'Token yok');

  if (!token) {
    console.log('❌ Auth Middleware: Token bulunamadı');
    res.status(401).json({
      success: false,
      error: 'Access token required'
    });
    return;
  }

  try {
    console.log('🔍 Auth Middleware: Token doğrulanıyor...');
    const decoded = verifyToken(token);
    console.log('✅ Auth Middleware: Token decode edildi:', decoded);
    
    // Try to find user in mock data first
    let user = findById(users, decoded.userId);
    console.log('👤 Auth Middleware: Mock data\'da user bulundu:', user ? 'Evet' : 'Hayır');
    
    // If not found in mock data, create a simple user object for simple tokens
    if (!user && decoded.email) {
      console.log('👤 Auth Middleware: Simple token için user oluşturuluyor');
      user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.email.split('@')[0],
        password: '',
        firstName: 'User',
        lastName: 'Name',
        role: decoded.role,
        department: 'General',
        phone: '',
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    if (!user || !user.isActive) {
      console.log('❌ Auth Middleware: User bulunamadı veya aktif değil');
      res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
      return;
    }

    req.user = user;
    console.log('✅ Auth Middleware: Authentication başarılı, user set edildi');
    next();
  } catch (error) {
    console.log('❌ Auth Middleware: Token doğrulama hatası:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Authorization middleware for specific roles
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Check if user has admin role
export const requireAdmin = authorizeRoles('admin');
export const requireAdminAccess = authorizeRoles('admin');

// Check if user can manage users and system settings
export const requireManagerAccess = authorizeRoles('admin', 'manager');

// Check if user can manage inventory (admin, operator)
export const requireInventoryAccess = authorizeRoles('admin', 'operator');

// Check if user can manage work orders (admin, planner)
export const requirePlanningAccess = authorizeRoles('admin', 'planner');

// Check if user can use materials (admin, operator)
export const requireMaterialAccess = authorizeRoles('admin', 'operator');

// Check if user can manage purchasing (admin, manager)
export const requirePurchasingAccess = authorizeRoles('admin', 'manager');