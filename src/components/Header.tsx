import { useState } from 'react';
import { Bell, Search, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Ara..."
                className="block w-full pl-12 pr-4 py-3 border border-slate-200/50 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 sm:text-sm shadow-sm hover:shadow-md transition-all duration-300"
              />
            </div>
          </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 rounded-xl relative transition-all duration-300 hover:shadow-lg group"
            >
              <Bell className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 ring-2 ring-white shadow-lg animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-50">
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Bildirimler</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 border-b border-white/10 transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-2 shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">Kritik stok seviyesi</p>
                        <p className="text-sm text-slate-600">Malzeme A001 kritik seviyede</p>
                        <p className="text-xs text-slate-500 mt-1">5 dakika önce</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 border-b border-white/10 transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">Yeni iş emri</p>
                        <p className="text-sm text-slate-600">WO-2024-001 oluşturuldu</p>
                        <p className="text-xs text-slate-500 mt-1">1 saat önce</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-2 shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">Stok hareketi</p>
                        <p className="text-sm text-slate-600">100 adet malzeme girişi yapıldı</p>
                        <p className="text-xs text-slate-500 mt-1">2 saat önce</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-white/20">
                  <button className="w-full text-center text-sm bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 font-semibold transition-all duration-300">
                    Tüm bildirimleri görüntüle
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-sm font-bold text-white">
                  {(user?.firstName?.charAt(0)?.toUpperCase()) || (user?.email?.charAt(0)?.toUpperCase()) || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.role || 'Kullanıcı'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 py-2 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-300 rounded-xl mx-1"
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Profil</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 transition-all duration-300 rounded-xl mx-1"
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Ayarlar</span>
                </button>
                
                <div className="my-2 mx-3 border-t border-white/30"></div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 transition-all duration-300 rounded-xl mx-1"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;