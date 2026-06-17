import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Gift,
  BarChart3,
  Settings,
  Menu,
  X,
  Scissors,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/members', label: '会员管理', icon: Users },
  { path: '/checkout', label: '消费收银', icon: CreditCard },
  { path: '/recharge', label: '会员充值', icon: Wallet },
  { path: '/points', label: '积分管理', icon: Gift },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-primary-100 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-primary-100">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white">
                <Scissors size={20} />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-serif font-bold text-lg text-primary-800">理发店</h1>
                  <p className="text-xs text-primary-500">会员管理系统</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                          : 'text-primary-700 hover:bg-primary-50'
                      } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`}
                    >
                      <Icon size={20} />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {!sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-primary-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-serif text-xl font-semibold text-primary-800">
              {navItems.find(item => item.path === location.pathname)?.label || '理发店会员管理系统'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-600">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
