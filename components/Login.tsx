
import React, { useState } from 'react';
import { GraduationCap, LogIn, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password?: string) => void;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('admin@eduboost.com.br');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-4">
      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">EduBoost</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestão Inteligente para Reforço Escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
            <input 
              type="email" 
              className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <input 
              type="password" 
              className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogIn size={20} />
            )}
            {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Painel Administrativo Protegido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
