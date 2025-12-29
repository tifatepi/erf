
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
    { label: 'Alunos', value: stats.totalStudents.toString(), icon: <Users size={18} />, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Aulas', value: stats.classesDone.toString(), icon: <BookOpen size={18} />, color: 'bg-indigo-500', trend: '+8%' },
    { label: 'Receita', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.revenue), icon: <DollarSign size={18} />, color: 'bg-emerald-500', trend: '+15%' },
    { label: 'Atrasos', value: stats.pending.toString(), icon: <AlertTriangle size={18} />, color: 'bg-amber-500', trend: '-2%' },
  ];

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center sm:text-left">Painel de Controle</h2>
          <p className="text-slate-500 font-medium text-center sm:text-left text-sm md:text-base">Bem-vinda à sua central escolar inteligente.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95 w-full sm:w-auto">
          Exportar Dados
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statItems.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-2.5 md:p-3 rounded-xl text-white shadow-lg shadow-current/20`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              Fluxo Acadêmico
            </h3>
            <select className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-[10px] md:text-xs font-bold text-slate-600 outline-none">
              <option>6 Meses</option>
              <option>Este Ano</option>
            </select>
          </div>
          <div className="h-[250px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            Agenda do Dia
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {classes.filter(c => c.status === 'SCHEDULED').slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="bg-white shadow-sm border border-slate-100 text-indigo-600 px-2 py-1.5 rounded-xl text-center min-w-[50px]">
                  <p className="text-[8px] font-black uppercase leading-none mb-1 opacity-50">{session.date.split('-')[1]}</p>
                  <p className="text-base font-black leading-none">{session.date.split('-')[2]}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{session.subject}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={10} className="text-indigo-500" /> {session.time}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 truncate">
                      <Users size={10} className="text-emerald-500" /> {getStudentName(session.studentId).split(' ')[0]}
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
