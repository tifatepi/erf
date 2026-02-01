
import React, { useState } from 'react';
import { GraduationCap, LogIn, ShieldCheck, Loader2, Key, Mail, Info } from 'lucide-react';

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
      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-fade-in border border-white/20">
        <div className="text-center">
          <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">EduBoost</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestão Inteligente para Reforço Escolar</p>
        </div>

        {/* Bloco de Credenciais de Teste */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Acesso para Testes</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between bg-white/50 p-2 px-3 rounded-xl border border-indigo-50">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500">E-mail:</span>
              </div>
              <span className="text-[11px] font-black text-indigo-700">admin@eduboost.com.br</span>
            </div>
            <div className="flex items-center justify-between bg-white/50 p-2 px-3 rounded-xl border border-indigo-50">
              <div className="flex items-center gap-2">
                <Key size={12} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500">Senha:</span>
              </div>
              <span className="text-[11px] font-black text-indigo-700">admin123</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
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
            className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogIn size={20} />
            )}
            {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Ambiente Seguro SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
