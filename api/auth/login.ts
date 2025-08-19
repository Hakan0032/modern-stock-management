import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    } as ApiResponse);
  }

  try {
    console.log('🔐 API Login: İstek alındı');
    const { email, password }: LoginRequest = req.body;
    console.log('📧 API Login: Email:', email);
    console.log('🔑 API Login: Password length:', password?.length || 0);

    if (!email || !password) {
      console.log('❌ API Login: Eksik bilgiler');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    // Find user in hardcoded data
    console.log('🔍 API Login: Kullanıcı aranıyor:', email);
    const user = HARDCODED_USERS.find(u => u.email === email);
    console.log('👤 API Login: Kullanıcı bulundu:', !!user);
    
    if (!user) {
      console.log('❌ API Login: Kullanıcı bulunamadı');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
    }

    console.log('✅ API Login: Kullanıcı bulundu:', user.email);

    // Simple password check
    if (user.password !== password) {
      console.log('❌ API Login: Şifre yanlış');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
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
    return res.json({
      success: true,
      data: response,
      message: 'Login successful'
    } as ApiResponse<LoginResponse>);
  } catch (error) {
    console.error('❌ API Login: Hata:', error instanceof Error ? error.message : JSON.stringify(error));
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
}