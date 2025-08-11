import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpDown, 
  Settings, 
  ClipboardList, 
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils';

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user } = useAuthStore();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'operator', 'planner', 'operator', 'manager']
    },
    {
      name: 'Malzeme Kataloğu',
      href: '/materials',
      icon: Package,
      roles: ['admin', 'operator', 'planner', 'manager']
    },
    {
      name: 'Stok Hareketleri',
      href: '/movements',
      icon: ArrowUpDown,
      roles: ['admin', 'operator', 'planner']
    },
    {
      name: 'Makine & BOM',
      href: '/machines',
      icon: Settings,
      roles: ['admin', 'operator', 'planner']
    },
    {
      name: 'İş Emirleri',
      href: '/work-orders',
      icon: ClipboardList,
      roles: ['admin', 'planner', 'operator']
    },
    {
      name: 'Raporlar',
      href: '/reports',
      icon: BarChart3,
      roles: ['admin', 'operator', 'planner']
    },
    {
      name: 'Yönetim',
      href: '/admin',
      icon: Users,
      roles: ['admin']
    }
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-2xl transition-all duration-300 z-40",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Mermer Stok</span>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-lg group"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 shadow-lg border border-blue-200/50 backdrop-blur-sm"
                    : "text-slate-700 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-200/80 hover:shadow-lg hover:scale-[1.02]",
                  sidebarCollapsed && "justify-center"
                )
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                  )}
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all duration-300",
                    isActive ? "text-blue-600" : "text-slate-600 group-hover:text-slate-800 group-hover:scale-110"
                  )} />
                  {!sidebarCollapsed && (
                    <span className={cn(
                      "font-semibold transition-all duration-300",
                      isActive ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
                    )}>{item.name}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {(user?.firstName?.charAt(0)?.toUpperCase()) || (user?.email?.charAt(0)?.toUpperCase()) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent truncate">
                  {(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : (user?.email || 'Kullanıcı')}
                </p>
                <p className="text-xs text-slate-600 font-medium truncate">
                  {user?.role || 'Kullanıcı'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;