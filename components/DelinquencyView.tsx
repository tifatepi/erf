
import React, { useMemo } from 'react';
import { Payment, Student } from '../types';
import { AlertCircle, DollarSign, MessageCircle, Search, User, Calendar, ArrowRight } from 'lucide-react';

interface DelinquencyViewProps {
  payments: Payment[];
  students: Student[];
}

const DelinquencyView: React.FC<DelinquencyViewProps> = ({ payments, students }) => {
  const overduePayments = useMemo(() => 
    payments.filter(p => p.status === 'OVERDUE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date())),
    [payments]
  );

  const totalOverdue = overduePayments.reduce((acc, curr) => acc + curr.amount, 0);

  const getStudent = (id: string) => students.find(s => s.id === id);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleWhatsApp = (payment: Payment) => {
    const student = getStudent(payment.studentId);
    const message = `Olá, somos do EduBoost. Notamos um pagamento pendente de ${formatCurrency(payment.amount)} referente a ${payment.description} com vencimento em ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}. Poderia nos ajudar com a regularização?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inadimplência</h2>
          <p className="text-slate-500 font-medium">Gestão de recebíveis em atraso.</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="bg-rose-500 text-white p-2.5 rounded-xl shadow-lg shadow-rose-200">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Total em Aberto</p>
            <p className="text-xl font-black text-rose-600">{formatCurrency(totalOverdue)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Aluno</th>
                <th className="px-8 py-5">Referência</th>
                <th className="px-8 py-5">Vencimento</th>
                <th className="px-8 py-5 text-right">Valor</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {overduePayments.map(p => {
                const student = getStudent(p.studentId);
                return (
                  <tr key={p.id} className="hover:bg-rose-50/30 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-black text-xs">
                          {student?.name.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-slate-900">{student?.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{p.description}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-rose-600 text-xs font-black">
                        <Calendar size={14} />
                        {new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleWhatsApp(p)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                        >
                          <MessageCircle size={14} />
                          Lembrar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {overduePayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-30">
                    <AlertCircle className="mx-auto mb-2" size={40} />
                    <p className="font-black uppercase text-xs tracking-widest">Nenhuma inadimplência encontrada</p>
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

export default DelinquencyView;
