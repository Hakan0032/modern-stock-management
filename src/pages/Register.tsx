import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../utils';
import { api } from '../utils/api';

interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  phone?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Hata', {
        description: 'Zorunlu alanları doldurun'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Hata', {
        description: 'Şifreler eşleşmiyor'
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Hata', {
        description: 'Şifre en az 6 karakter olmalıdır'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Hata', {
        description: 'Geçerli bir email adresi girin'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const registerData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        department: formData.department || null,
        phone: formData.phone || null
      };

      await api.post('/auth/register', registerData);
      
      toast.success('Başarılı', {
        description: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.'
      });
      
      navigate('/login');
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' ? errorData : 
                          typeof errorData === 'object' ? (errorData?.message || 'Kayıt oluşturulamadı') : 
                          'Kayıt oluşturulamadı';
      toast.error('Kayıt Hatası', {
        description: errorMessage
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
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Mermer Makinesi
          </h2>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Stok Sistemi
          </h3>
          <p className="mt-4 text-gray-300 text-lg">
            Yeni hesap oluşturun
          </p>
        </div>

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Kullanıcı Adı *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  Ad *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Soyad *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Adresi *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                placeholder="Email adresinizi girin"
              />
            </div>

            {/* Department & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-white mb-2">
                  Departman
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                >
                  <option value="" className="bg-gray-800">Seçiniz</option>
                  <option value="Üretim" className="bg-gray-800">Üretim</option>
                  <option value="Depo" className="bg-gray-800">Depo</option>
                  <option value="Teknik" className="bg-gray-800">Teknik</option>
                  <option value="Yönetim" className="bg-gray-800">Yönetim</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Telefon numaranız"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Şifrenizi girin (en az 6 karakter)"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Şifre Tekrarı *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
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
                  : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-500/50 hover:shadow-green-500/25"
              )}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Hesap oluşturuluyor...</span>
                </div>
              ) : (
                <span className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Hesap Oluştur</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-gray-300">
            Zaten hesabınız var mı?{' '}
            <Link 
              to="/login" 
              className="font-medium text-green-400 hover:text-green-300 transition-colors duration-300"
            >
              Giriş Yap
            </Link>
          </p>
        </div>

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

export default Register;