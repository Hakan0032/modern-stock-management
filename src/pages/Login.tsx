import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { cn } from '../utils/cn';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('🚀 Login Page: Giriş denemesi başlatıldı');
      console.log('📧 Login Page: Email:', email);
      console.log('🔑 Login Page: Password length:', password?.length || 0);
      console.log('🌐 Login Page: Current URL:', window.location.href);
      
      // Auth store'u güncelle - gerçek API çağrısı
      console.log('📞 Login Page: Auth store login çağrılıyor...');
      await login({ email, password });
      console.log('✅ Login Page: Login başarılı!');
      
      toast.success('Giriş başarılı!');
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('❌ Login Page: Login hatası detayı:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      
      // Kullanıcıya gösterilecek hata mesajı
      const userMessage = error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      console.log('💬 Login Page: Kullanıcıya gösterilen mesaj:', userMessage);
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
      console.log('🏁 Login Page: Loading durumu false yapıldı');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Mermer Makinesi
          </h1>
          <h2 className="text-lg text-purple-200 mb-6">
            Stok Sistemi
          </h2>
          <p className="text-purple-100">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3 text-center">
            Demo Hesap
          </h3>
          <div className="text-center text-sm text-purple-100">
            <p className="mb-1">Email: <span className="font-mono text-white">admin@test.com</span></p>
            <p>Şifre: <span className="font-mono text-white">admin123</span></p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                placeholder="Email adresinizi girin"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-200 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white transition-all duration-300",
                isLoading
                  ? "bg-gray-500/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/50"
              )}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Giriş Yap</span>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-purple-200">
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              className="font-semibold text-white hover:text-purple-100 transition-colors duration-200 underline decoration-purple-300 hover:decoration-white"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;