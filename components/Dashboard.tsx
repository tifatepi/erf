
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, DollarSign, Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { ClassSession, Student } from '../types';

interface DashboardProps {
  stats: {
    totalStudents: number;
    classesDone: number;
    revenue: number;
    pending: number;
  };
  classes: ClassSession[];
  students: Student[];
}

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 900 },
];

const Dashboard: React.FC<DashboardProps> = ({ stats, classes, students }) => {
  const statItems = [
    { label: 'Total Alunos', value: stats.totalStudents.toString(), icon: <Users size={20} />, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Aulas Realizadas', value: stats.classesDone.toString(), icon: <BookOpen size={20} />, color: 'bg-indigo-500', trend: '+8%' },
    { label: 'Receita (Paga)', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue), icon: <DollarSign size={20} />, color: 'bg-emerald-500', trend: '+15%' },
    { label: 'Pendências', value: stats.pending.toString(), icon: <AlertTriangle size={20} />, color: 'bg-amber-500', trend: '-2%' },
  ];

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel de Controle</h2>
          <p className="text-slate-500 font-medium">Bem-vinda de volta ao EduBoost, sua central de inteligência escolar.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            Exportar Dados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statItems.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3.5 rounded-2xl text-white shadow-lg shadow-current/20`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              Fluxo Acadêmico
            </h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{stroke: '#6366f1', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
             <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
            Agenda do Dia
          </h3>
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {classes.filter(c => c.status === 'SCHEDULED').slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-all group">
                <div className="bg-white shadow-sm border border-slate-100 text-indigo-600 px-3 py-2.5 rounded-2xl text-center min-w-[60px]">
                  <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-50">{session.date.split('-')[1]}</p>
                  <p className="text-xl font-black leading-none">{session.date.split('-')[2]}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{session.subject}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500" /> {session.time}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 truncate">
                      <Users size={12} className="text-emerald-500" /> {getStudentName(session.studentId)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
