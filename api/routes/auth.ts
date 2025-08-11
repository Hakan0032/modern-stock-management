/**
 * Authentication API routes
 * Handle user login, token management, etc.
 */
import { Router, type Request, type Response } from 'express';

import type { LoginRequest, LoginResponse, ApiResponse } from '../../shared/types';
import { findByEmail, users } from '../data/mockData';
import { generateToken, generateRefreshToken, authenticateToken, verifyToken } from '../middleware/auth';

const router = Router();

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
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

    // For demo purposes, we'll use a simple password check
    // In production, you would hash passwords and compare with bcrypt
    const validPassword = password === 'password123'; // Demo password
    
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * Get current user info
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      } as ApiResponse);
      return;
    }

    const decoded = verifyToken(refreshToken);
    const user = findByEmail(decoded.email);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      } as ApiResponse);
      return;
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      },
      message: 'Token refreshed successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    } as ApiResponse);
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real application, you would invalidate the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout successful'
    } as ApiResponse);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;