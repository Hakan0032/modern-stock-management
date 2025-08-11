import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { cn } from '../utils';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Hata', {
        description: 'Email ve şifre gereklidir'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ email, password });
      toast.success('Başarılı', {
        description: 'Giriş başarılı'
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error('Giriş Hatası', {
        description: error.response?.data?.error || 'Giriş yapılamadı'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Mermer Makinesi
          </h2>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Stok Sistemi
          </h3>
          <p className="mt-4 text-gray-300 text-lg">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-3 animate-pulse"></div>
            Demo Hesapları
          </h3>
          <div className="text-sm text-gray-200 space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="font-medium text-purple-300">Admin:</span>
              <span className="text-gray-300">admin@mermermakinesi.com</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="font-medium text-blue-300">Depo:</span>
              <span className="text-gray-300">depo@mermermakinesi.com</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="font-medium text-green-300">Planlama:</span>
              <span className="text-gray-300">planlama@mermermakinesi.com</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="font-medium text-yellow-300">Teknisyen:</span>
              <span className="text-gray-300">teknisyen@mermermakinesi.com</span>
            </div>
            <div className="text-center pt-2 border-t border-white/10">
              <span className="text-xs text-gray-400">Tüm hesaplar için şifre: </span>
              <span className="text-xs font-mono text-white bg-white/10 px-2 py-1 rounded">password123</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
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
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
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
                  className="block w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-white transition-colors"
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
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white transition-all duration-300 transform hover:scale-105 shadow-2xl",
                isLoading
                  ? "bg-gray-500/50 cursor-not-allowed backdrop-blur-sm"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-500/50 hover:shadow-purple-500/25"
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
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-sm text-gray-400">
            © 2024 Mermer Makinesi Stok Sistemi
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;