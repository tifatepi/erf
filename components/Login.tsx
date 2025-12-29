
import React, { useState } from 'react';
import { GraduationCap, LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@eduboost.com.br');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - aceita qualquer admin por enquanto
    onLogin('ADMIN');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-4">
      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">EduBoost</h1>
          <p className="text-slate-500 mt-2">Gestão Inteligente para Reforço Escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Lembrar-me
            </label>
            <a href="#" className="text-indigo-600 font-semibold hover:underline">Esqueci a senha</a>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogIn size={20} />
            Entrar no Sistema
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck size={14} />
            <span>Conexão Segura SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
