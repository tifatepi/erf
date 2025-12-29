
import React, { useState, useEffect } from 'react';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants';
import { User } from '../types';
import { Menu, X, LogOut, Bell, ChevronRight, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredNav = NAVIGATION_ITEMS.filter(item => item.roles.includes(user.role));

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Backdrop for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-[70]' : 'relative'}
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
          bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col
        `}
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="bg-indigo-600 p-2 rounded-lg shrink-0 shadow-lg shadow-indigo-200">
            <GraduationCap className="text-white" size={20} />
          </div>
          {(isSidebarOpen || isMobile) && <h1 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">{APP_NAME}</h1>}
        </div>

        <nav className="flex-1 mt-4 px-3 overflow-y-auto overflow-x-hidden">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {(isSidebarOpen || isMobile) && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${(isSidebarOpen || isMobile) ? 'justify-start' : 'justify-center'}`}>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 shrink-0" 
            />
            {(isSidebarOpen || isMobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-tighter">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-400">
              <span className="font-medium hidden xs:inline">Sistema</span>
              <ChevronRight size={10} className="hidden xs:inline" />
              <span className="text-slate-600 font-bold capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
