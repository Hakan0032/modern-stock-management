/**
 * Simple Authentication API routes
 * Hardcoded authentication without Supabase
 */
import { Router, type Request, type Response } from 'express';

import type { LoginRequest, LoginResponse, ApiResponse, User } from '../../shared/types';

// Simple hardcoded user data
const HARDCODED_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin' as const,
    department: 'IT',
    phone: '+90 555 123 4567',
    isActive: true,
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Simple token generation (just base64 encoded user info)
function generateSimpleToken(user: any): string {
  const tokenData = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

const router = Router();

/**
 * Simple User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 API Login: İstek alındı');
    const { email, password }: LoginRequest = req.body;
    console.log('📧 API Login: Email:', email);
    console.log('🔑 API Login: Password length:', password?.length || 0);

    if (!email || !password) {
      console.log('❌ API Login: Eksik bilgiler');
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
      return;
    }

    // Find user in hardcoded data
    console.log('🔍 API Login: Kullanıcı aranıyor:', email);
    const user = HARDCODED_USERS.find(u => u.email === email);
    console.log('👤 API Login: Kullanıcı bulundu:', !!user);
    
    if (!user) {
      console.log('❌ API Login: Kullanıcı bulunamadı');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
      return;
    }

    console.log('✅ API Login: Kullanıcı bulundu:', user.email);

    // Simple password check
    if (user.password !== password) {
      console.log('❌ API Login: Şifre yanlış');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
      return;
    }

    console.log('✅ API Login: Şifre doğru');
    console.log('✅ API Login: Giriş başarılı');

    // Generate simple token
    const token = generateSimpleToken(user);
    const refreshToken = generateSimpleToken(user); // Same for simplicity
    console.log('🎫 API Login: Token oluşturuldu');

    // Update last login (just for response)
    user.lastLogin = new Date().toISOString();

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

    console.log('✅ API Login: Başarılı yanıt gönderiliyor');
    res.json({
      success: true,
      data: response,
      message: 'Login successful'
    } as ApiResponse<LoginResponse>);
  } catch (error) {
    console.error('❌ API Login: Hata:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * Get current user info (simplified)
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👤 SIMPLE AUTH - Getting user info');
    
    // For simplicity, just return the admin user
    const user = HARDCODED_USERS[0]; // Admin user
    
    res.json({
      success: true,
      data: {
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
      },
      message: 'User info retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ SIMPLE AUTH - Get user info error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * Simple Refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 SIMPLE AUTH - Token refresh');
    
    // For simplicity, just generate new tokens for admin user
    const user = HARDCODED_USERS[0];
    const newToken = generateSimpleToken(user);
    const newRefreshToken = generateSimpleToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      },
      message: 'Token refreshed successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ SIMPLE AUTH - Refresh token error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    } as ApiResponse);
  }
});

/**
 * Simple User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📝 API Register: İstek alındı');
    const { username, firstName, lastName, email, password, department, phone } = req.body;
    console.log('📧 API Register: Email:', email);

    // Validation
    if (!username || !firstName || !lastName || !email || !password) {
      console.log('❌ API Register: Eksik bilgiler');
      res.status(400).json({
        success: false,
        error: 'Tüm gerekli alanlar doldurulmalıdır'
      } as ApiResponse);
      return;
    }

    // Check if user already exists
    const existingUser = HARDCODED_USERS.find(u => u.email === email || u.username === username);
    if (existingUser) {
      console.log('❌ API Register: Kullanıcı zaten mevcut');
      res.status(409).json({
        success: false,
        error: 'Bu email veya kullanıcı adı zaten kullanılıyor'
      } as ApiResponse);
      return;
    }

    // Create new user
    const newUser = {
      id: String(HARDCODED_USERS.length + 1),
      username,
      firstName,
      lastName,
      email,
      password,
      role: 'operator' as const,
      department: department || 'Genel',
      phone: phone || '',
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to hardcoded users array
    HARDCODED_USERS.push(newUser);
    console.log('✅ API Register: Yeni kullanıcı oluşturuldu:', newUser.email);

    // Generate tokens
    const token = generateSimpleToken(newUser);
    const refreshToken = generateSimpleToken(newUser);

    const response: LoginResponse = {
      token,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone,
        isActive: newUser.isActive,
        lastLogin: newUser.lastLogin,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    };

    console.log('✅ API Register: Başarılı yanıt gönderiliyor');
    res.status(201).json({
      success: true,
      data: response,
      message: 'Hesap başarıyla oluşturuldu'
    } as ApiResponse<LoginResponse>);
  } catch (error) {
    console.error('❌ API Register: Hata:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    } as ApiResponse);
  }
});

/**
 * Simple User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🚪 SIMPLE AUTH - Logout');
    res.json({
      success: true,
      message: 'Logout successful'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ SIMPLE AUTH - Logout error:', error instanceof Error ? error.message : JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;