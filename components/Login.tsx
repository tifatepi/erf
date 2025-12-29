
import React, { useState } from 'react';
import { GraduationCap, LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: string, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@eduboost.com.br');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em produção, o Supabase Auth validaria o email/senha.
    // Aqui simulamos o sucesso enviando os dados para busca de perfil.
    onLogin('ADMIN', email);
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
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
            <input 
              type="email" 
              className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <input 
              type="password" 
              className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-500 font-bold cursor-pointer">
              <input type="checkbox" className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Manter Conectado
            </label>
            <a href="#" className="text-indigo-600 font-black hover:underline uppercase tracking-tighter">Esqueci a senha</a>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogIn size={20} />
            Entrar no Sistema
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Conexão Segura Supabase SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
