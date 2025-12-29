
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    handleResize();
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
      {/* Sidebar Backdrop (Apenas Mobile) - Z-INDEX 90 */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Z-INDEX 100 */}
      <aside 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-[100] shadow-2xl' : 'relative'}
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
          ${isMobile && !isSidebarOpen ? 'invisible' : 'visible'}
          bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col
        `}
      >
        {/* Logo Section na Sidebar */}
        <div className="p-6 flex items-center gap-3 overflow-hidden shrink-0 border-b border-slate-50">
          <div className="bg-indigo-600 p-2.5 rounded-xl shrink-0 shadow-lg shadow-indigo-200">
            <GraduationCap className="text-white" size={20} />
          </div>
          {(isSidebarOpen || isMobile) && (
            <h1 className="text-xl font-black text-slate-800 tracking-tight whitespace-nowrap">
              {APP_NAME}
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3 overflow-y-auto overflow-x-hidden space-y-1 custom-scrollbar">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {(isSidebarOpen || isMobile) && (
                <span className="font-bold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${(isSidebarOpen || isMobile) ? 'justify-start' : 'justify-center'}`}>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0" 
            />
            {(isSidebarOpen || isMobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[9px] text-slate-400 truncate uppercase font-black tracking-tighter">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header - Z-INDEX 50 e Sticky */}
        <header className="sticky top-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
          <div className="flex items-center gap-3">
            {/* BOTÃO DE MENU MOBILE REFORÇADO */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-all lg:hidden active:scale-90 border border-slate-200"
              aria-label="Abrir Menu"
            >
              <Menu size={22} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg lg:hidden">
                <GraduationCap className="text-white" size={16} />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="hover:text-indigo-600 cursor-pointer">Painel</span>
                <ChevronRight size={12} />
                <span className="text-slate-900 font-black">{activeTab}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 hidden xs:block"></div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="hidden md:inline uppercase tracking-widest">Sair</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
