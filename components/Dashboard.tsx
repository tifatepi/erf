
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, DollarSign, Calendar, TrendingUp, AlertTriangle, Clock, HandCoins, ChevronRight } from 'lucide-react';
import { ClassSession, Student, Payment } from '../types';

interface DashboardProps {
  stats: {
    totalStudents: number;
    classesDone: number;
    revenue: number;
    pending: number;
  };
  classes: ClassSession[];
  students: Student[];
  payments: Payment[];
}

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 900 },
];

const Dashboard: React.FC<DashboardProps> = ({ stats, classes, students, payments }) => {
  const statItems = [
    { label: 'Alunos', value: stats.totalStudents.toString(), icon: <Users size={18} />, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Aulas', value: stats.classesDone.toString(), icon: <BookOpen size={18} />, color: 'bg-indigo-500', trend: '+8%' },
    { label: 'Receita', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.revenue), icon: <DollarSign size={18} />, color: 'bg-emerald-500', trend: '+15%' },
    { label: 'Atrasos', value: stats.pending.toString(), icon: <AlertTriangle size={18} />, color: 'bg-amber-500', trend: '-2%' },
  ];

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  // Lógica para filtrar Contas a Receber (Próximos 30 dias a partir do 1º dia do mês atual)
  const receivables = React.useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysLater = new Date(firstDayOfMonth.getTime() + (30 * 24 * 60 * 60 * 1000));

    return payments
      .filter(p => {
        if (p.status === 'PAID') return false;
        const dueDate = new Date(p.dueDate + 'T12:00:00');
        return dueDate >= firstDayOfMonth && dueDate <= thirtyDaysLater;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5); // Mostra os 5 primeiros mais urgentes
  }, [payments]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Resumo Geral</h2>
          <p className="text-slate-500 font-medium text-sm">Acompanhe os principais indicadores da escola.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95">
          Relatório Completo
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statItems.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              Crescimento Acadêmico
            </h3>
            <div className="flex gap-2">
               <button className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">Mês</button>
               <button className="text-[10px] font-bold px-3 py-1 text-slate-400">Ano</button>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Classes Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            Próximas Aulas
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] lg:max-h-none pr-1">
            {classes.filter(c => c.status === 'SCHEDULED').length > 0 ? (
              classes.filter(c => c.status === 'SCHEDULED').slice(0, 6).map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-all cursor-default">
                  <div className="bg-white shadow-sm border border-slate-100 text-indigo-600 px-2 py-2 rounded-xl text-center min-w-[50px] shrink-0">
                    <p className="text-[9px] font-black uppercase leading-none mb-1 opacity-50">{session.date.split('-')[1]}</p>
                    <p className="text-lg font-black leading-none">{session.date.split('-')[2]}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{session.subject}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} className="text-indigo-500" /> {session.time}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 truncate">
                        <Users size={12} className="text-emerald-500" /> {getStudentName(session.studentId).split(' ')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <Calendar size={32} />
                <p className="text-xs font-bold uppercase mt-2">Sem aulas agendadas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Section: Contas a Receber (Próximos 30 dias) */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Contas a Receber <span className="text-xs font-medium text-slate-400 ml-2">(Próximos 30 dias)</span>
          </h3>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            Ver Financeiro <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="pb-4 px-4">Aluno</th>
                <th className="pb-4 px-4">Vencimento</th>
                <th className="pb-4 px-4 text-right">Valor</th>
                <th className="pb-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receivables.length > 0 ? (
                receivables.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                          {getStudentName(p.studentId).charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-slate-700">{getStudentName(p.studentId)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(p.amount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                          p.status === 'OVERDUE' 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {p.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center opacity-30">
                    <div className="flex flex-col items-center">
                      <HandCoins size={32} />
                      <p className="text-xs font-bold uppercase mt-2">Nenhum recebimento previsto para este período</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
