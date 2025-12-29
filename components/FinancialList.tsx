
import React, { useState } from 'react';
import { Payment, Student } from '../types';
import { CheckCircle2, AlertCircle, Clock, Search, DollarSign, X } from 'lucide-react';

interface FinancialListProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (payment: Payment) => void;
}

const FinancialList: React.FC<FinancialListProps> = ({ payments, students, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPay, setNewPay] = useState({ studentId: '', amount: 0, description: '' });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  const statusStyles = {
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={14} />, label: 'Pago' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={14} />, label: 'Pendente' },
    OVERDUE: { bg: 'bg-rose-50', text: 'text-rose-700', icon: <AlertCircle size={14} />, label: 'Atrasado' },
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPay.studentId && newPay.amount > 0) {
      onAddPayment({
        id: '',
        ...newPay,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'PAID'
      } as Payment);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
          <p className="text-slate-500">Gerencie mensalidades e faturamento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <DollarSign size={18} />
          Lançar Receita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Faturamento Mês</p>
            <p className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payments.reduce((acc, p) => acc + p.amount, 0))}
            </p>
          </div>
        </div>
        {/* ... stats cards ... */}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Referência</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment, idx) => {
                const style = statusStyles[payment.status];
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {getStudentName(payment.studentId)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${style.bg} ${style.text}`}>
                        {style.icon}
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <h3 className="font-bold text-lg">Registrar Pagamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newPay.studentId}
                  onChange={e => setNewPay({...newPay, studentId: e.target.value})}
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
                <input 
                  type="number" required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newPay.amount || ''}
                  onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <input 
                  type="text" placeholder="Ex: Mensalidade Dezembro"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newPay.description}
                  onChange={e => setNewPay({...newPay, description: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                Confirmar Recebimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
