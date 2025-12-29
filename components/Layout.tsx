
import React, { useState } from 'react';
import { NAVIGATION_ITEMS, APP_NAME, MOCK_USER } from '../constants';
import { UserRole } from '../types';
import { Menu, X, LogOut, Bell, ChevronRight, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, setUserRole, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const filteredNav = NAVIGATION_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shrink-0 shadow-lg shadow-indigo-200">
            <GraduationCap className="text-white" size={20} />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-bold text-slate-800 tracking-tight">{APP_NAME}</h1>}
        </div>

        <nav className="flex-1 mt-4 px-3 overflow-y-auto overflow-x-hidden">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <img src={MOCK_USER.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200" />
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{MOCK_USER.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-tighter">{userRole}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium">Sistema</span>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-bold capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Encerrar</span>
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
