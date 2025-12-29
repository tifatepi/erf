
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/supabaseService';
import { 
  UserPlus, 
  Search, 
  Mail, 
  ShieldCheck, 
  Edit2, 
  Trash2, 
  X,
  Filter,
  AlertCircle
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.ALUNO
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await db.profiles.list();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await db.profiles.create(newUser);
      setUsers(prev => [...prev, created]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', role: UserRole.ALUNO });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao conectar com o Supabase. Verifique o console.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este acesso?")) {
      try {
        await db.profiles.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        alert("Erro ao deletar");
      }
    }
  };

  const roleColors = {
    [UserRole.ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
    [UserRole.PROFESSOR]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [UserRole.RESPONSAVEL]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [UserRole.ALUNO]: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administração de Usuários</h2>
          <p className="text-slate-500 font-medium">Controle de acessos e atribuições de permissões.</p>
        </div>
        <button 
          onClick={() => { setErrorMsg(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Convidar Usuário
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all">
            <Filter size={18} />
            Filtrar Cargos
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Carregando usuários...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.1em]">
                  <th className="px-8 py-5">Nome do Usuário</th>
                  <th className="px-8 py-5">E-mail de Acesso</th>
                  <th className="px-8 py-5 text-center">Cargo / Função</th>
                  <th className="px-8 py-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail size={14} className="text-slate-300" />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Convidar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Convidar Usuário</h3>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Credenciais</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              {errorMsg && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 border border-rose-100 text-sm font-bold animate-pulse">
                  <AlertCircle size={20} />
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                <input 
                  type="email" required
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo no Sistema</label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.ADMIN}>Administrador</option>
                  <option value={UserRole.PROFESSOR}>Professor</option>
                  <option value={UserRole.RESPONSAVEL}>Responsável</option>
                  <option value={UserRole.ALUNO}>Aluno</option>
                </select>
              </div>
              <div className="pt-4 flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <ShieldCheck size={20} className="text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold leading-tight uppercase">
                  O sistema criará o perfil diretamente no banco de dados.
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Gravando...' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
