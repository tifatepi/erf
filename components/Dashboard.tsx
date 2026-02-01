
import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, BookOpen, DollarSign, Calendar, TrendingUp, AlertTriangle, 
  Clock, HandCoins, ChevronRight, Wallet, FileText, CheckCircle2, 
  X, Loader2, Download, GraduationCap, QrCode, ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { ClassSession, Student, Payment } from '../types';
import { timeService } from '../services/timeService';

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
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
}

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 900 },
];

const Dashboard: React.FC<DashboardProps> = ({ stats, classes, students, payments, onUpdatePayment }) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeService.now());
  const receiptRef = useRef<HTMLDivElement>(null);

  // Efeito para manter o relógio atualizado a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(timeService.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statItems = [
    { label: 'Alunos', value: stats.totalStudents.toString(), icon: <Users size={18} />, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Aulas', value: stats.classesDone.toString(), icon: <BookOpen size={18} />, color: 'bg-indigo-500', trend: '+8%' },
    { label: 'Receita', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.revenue), icon: <DollarSign size={18} />, color: 'bg-emerald-500', trend: '+15%' },
    { label: 'Atrasos', value: stats.pending.toString(), icon: <AlertTriangle size={18} />, color: 'bg-amber-500', trend: '-2%' },
  ];

  const getStudentName = (id: string) => {
    if (!students || students.length === 0) return 'Carregando...';
    return students.find(s => String(s.id) === String(id))?.name || 'Aluno Removido';
  };

  const statusStyles = {
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={12} />, label: 'Pago' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={12} />, label: 'Pendente' },
    OVERDUE: { bg: 'bg-rose-50', text: 'text-rose-700', icon: <AlertCircle size={12} />, label: 'Atrasado' },
  };

  const receivables = React.useMemo(() => {
    if (!payments) return [];
    const now = timeService.now();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const limitDate = new Date(startOfMonth.getTime() + (30 * 24 * 60 * 60 * 1000));

    return payments
      .filter(p => {
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate + 'T12:00:00');
        return p.status !== 'PAID' && (dueDate >= startOfMonth && dueDate <= limitDate || p.status === 'OVERDUE');
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);
  }, [payments]);

  const totalReceivablePeriod = receivables.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSetPaid = async (payment: Payment) => {
    if (!window.confirm(`Confirmar recebimento de ${formatCurrency(payment.amount)} de ${getStudentName(payment.studentId)}?`)) return;
    try {
      await onUpdatePayment(payment.id, {
        status: 'PAID',
        paymentDate: timeService.todayISO()
      });
    } catch (err) {
      alert("Erro ao processar pagamento.");
    }
  };

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const downloadPDF = () => {
    if (!receiptRef.current) return;
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) return;
    setIsGeneratingPDF(true);
    const element = receiptRef.current;
    const opt = {
      margin: 0, filename: `recibo-${getStudentName(selectedPayment?.studentId || '').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save().then(() => setIsGeneratingPDF(false));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Formatadores de Data e Hora
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Relógio e Boas-vindas */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
              Painel Administrativo
            </span>
            {timeService.getIsSynced() && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Hora Oficial
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Bom dia, <span className="text-indigo-600">Admin</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-md">Bem-vindo ao EduBoost. Aqui estão os dados oficiais sincronizados com Brasília.</p>
        </div>

        <div className="z-10 flex flex-col items-start lg:items-end text-slate-900">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter">
              {formattedTime.split(':')[0]}:{formattedTime.split(':')[1]}
            </span>
            <span className="text-xl md:text-2xl font-black text-indigo-400 tabular-nums">
              {formattedTime.split(':')[2]}
            </span>
          </div>
          <p className="text-xs md:text-sm font-bold text-slate-400 capitalize mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-400" />
            {formattedDate}
          </p>
        </div>
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
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            Próximas Aulas
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] lg:max-h-none pr-1 custom-scrollbar">
            {classes.filter(c => c.status === 'SCHEDULED').slice(0, 6).map((session) => (
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
            ))}
            {classes.filter(c => c.status === 'SCHEDULED').length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <Calendar size={32} />
                <p className="text-xs font-bold uppercase mt-2">Sem aulas agendadas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Contas a Receber (Versão Fluxo Financeiro) */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Fluxo de Recebimentos</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próximos 30 dias e atrasados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 transition-all hover:bg-emerald-100">
              <Wallet className="text-emerald-500" size={18} />
              <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-tight">Total Previsto</p>
                <p className="text-sm font-black text-emerald-700 leading-none">{formatCurrency(totalReceivablePeriod)}</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1 group">
              Ver Completo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Aluno</th>
                <th className="px-8 py-5">Referência</th>
                <th className="px-8 py-5 text-right">Valor</th>
                <th className="px-8 py-5">Vencimento</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receivables.map((payment) => {
                const isOverdue = new Date(payment.dueDate + 'T23:59:59') < timeService.now();
                const style = isOverdue ? statusStyles.OVERDUE : statusStyles.PENDING;
                
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5 font-bold text-slate-900">{getStudentName(payment.studentId)}</td>
                    <td className="px-8 py-5 font-medium text-slate-500">{payment.description}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-8 py-5 font-medium text-slate-500">
                      {new Date(payment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase border ${style.bg} ${style.text}`}>
                          {style.icon}
                          {isOverdue ? 'Atrasado' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                         <button 
                            onClick={() => handleSetPaid(payment)}
                            className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90 flex items-center gap-2 text-[10px] font-black uppercase"
                          >
                            <HandCoins size={14} />
                            Receber
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {receivables.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center opacity-40">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Nenhuma conta a receber para o período</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Recibo */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/10 my-8">
            <div className="p-6 md:p-8 border-b border-slate-700 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-black text-lg">Recibo Digital</h3>
              <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <div className="p-4 md:p-8 bg-slate-700 flex justify-center items-center">
              <div ref={receiptRef} style={{ width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '20mm', display: 'flex', flexDirection: 'column' }} className="pdf-canvas shadow-xl">
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ backgroundColor: '#4f46e5', padding: '8px', borderRadius: '10px' }}>
                          <GraduationCap color="white" size={24} />
                       </div>
                       <h2 style={{ fontWeight: '900', fontSize: '24px', color: '#111827' }}>EduBoost</h2>
                    </div>
                    <p style={{ fontWeight: '800', color: '#64748b' }}>#{selectedPayment.id.slice(0,8).toUpperCase()}</p>
                 </div>
                 <div style={{ backgroundColor: '#f8fafc', padding: '30px', textAlign: 'center', marginBottom: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '900', letterSpacing: '0.1em' }}>Valor Recebido</p>
                    <h1 style={{ fontSize: '48px', fontWeight: '950', color: '#4f46e5', margin: '5px 0' }}>{formatCurrency(selectedPayment.amount)}</h1>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                       <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900' }}>Recebemos de</p>
                       <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{getStudentName(selectedPayment.studentId)}</p>
                    </div>
                    <div>
                       <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900' }}>Referente a</p>
                       <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.description}</p>
                    </div>
                    <div>
                       <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900' }}>Data da Quitação</p>
                       <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                    </div>
                 </div>
                 <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '30px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '900', color: '#1e293b' }}>EduBoost Gestão de Reforço Escolar</p>
                    <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '5px' }}>Autenticação Eletrônica: {selectedPayment.id}</p>
                    <QrCode size={60} style={{ margin: '20px auto', color: '#1e293b' }} />
                 </div>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setIsReceiptOpen(false)} className="flex-1 px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black">Fechar</button>
              <button onClick={downloadPDF} disabled={isGeneratingPDF} className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3">
                {isGeneratingPDF ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Baixar Recibo PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
