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

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required'
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = findById(users, decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
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