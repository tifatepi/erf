
import React, { useState, useRef } from 'react';
import { Payment, Student } from '../types';
import { CheckCircle2, AlertCircle, Clock, Search, DollarSign, X, Calendar as CalendarIcon, Save, Info, FileText, Printer, GraduationCap } from 'lucide-react';

interface FinancialListProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (payment: Partial<Payment>) => Promise<void>;
}

const FinancialList: React.FC<FinancialListProps> = ({ payments, students, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  
  const [newPay, setNewPay] = useState({ 
    studentId: '', 
    amount: 0, 
    description: 'Janeiro', 
    date: today,
    dueDate: today,
    status: 'PAID' as 'PAID' | 'PENDING' | 'OVERDUE'
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  const statusStyles = {
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={12} />, label: 'Pago' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={12} />, label: 'Pendente' },
    OVERDUE: { bg: 'bg-rose-50', text: 'text-rose-700', icon: <AlertCircle size={12} />, label: 'Atrasado' },
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPay.studentId || newPay.amount <= 0) {
      alert("Por favor, selecione um aluno e informe um valor válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPayment({
        studentId: newPay.studentId,
        amount: newPay.amount,
        dueDate: newPay.dueDate,
        paymentDate: newPay.date,
        description: `Mensalidade ${newPay.description}`,
        status: newPay.status
      });
      setIsModalOpen(false);
      setNewPay({ studentId: '', amount: 0, description: 'Janeiro', date: today, dueDate: today, status: 'PAID' });
    } catch (err) {
      alert("Erro ao salvar lançamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPayments = payments.filter(p => 
    getStudentName(p.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateWithTime = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    // Se não houver hora gravada (string de data simples), usamos a hora atual para o recibo de emissão
    const now = new Date();
    return `${date.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estilo para Impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Fluxo Financeiro</h2>
          <p className="text-slate-500 font-medium text-sm">Controle de recebimentos e mensalidades.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <DollarSign size={18} />
          Lançar Receita
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Receita Total</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0))}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">A Receber</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(payments.filter(p => p.status !== 'PAID').reduce((acc, p) => acc + p.amount, 0))}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hidden sm:block">
          <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <Info size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Registros</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">{payments.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por aluno ou mês..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-6 md:px-8 py-5">Aluno</th>
                <th className="px-6 md:px-8 py-5">Referência</th>
                <th className="px-6 md:px-8 py-5 text-right">Valor</th>
                <th className="px-6 md:px-8 py-5">Vencimento</th>
                <th className="px-6 md:px-8 py-5 text-center">Status</th>
                <th className="px-6 md:px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredPayments.map((payment, idx) => {
                const style = statusStyles[payment.status] || statusStyles.PENDING;
                return (
                  <tr key={payment.id || idx} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 md:px-8 py-5">
                      <p className="font-bold text-slate-900 truncate max-w-[150px]">{getStudentName(payment.studentId)}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <p className="font-medium text-slate-500 truncate">{payment.description}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right">
                      <p className="font-black text-slate-900 whitespace-nowrap">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                        <CalendarIcon size={14} className="opacity-40 shrink-0" />
                        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase border whitespace-nowrap ${style.bg} ${style.text}`}>
                          {style.icon}
                          {style.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex justify-center">
                        {payment.status === 'PAID' ? (
                          <button 
                            onClick={() => handleOpenReceipt(payment)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Gerar Recibo"
                          >
                            <FileText size={18} />
                          </button>
                        ) : (
                          <span className="text-slate-200"><FileText size={18} /></span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lançar Receita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-2 md:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
            <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-600 text-white sticky top-0 z-10">
              <div>
                <h3 className="font-black text-xl md:text-2xl tracking-tight">Nova Receita</h3>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-1">Lançamento financeiro</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno</label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  value={newPay.studentId}
                  onChange={e => setNewPay({...newPay, studentId: e.target.value})}
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Referente ao Mês</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    value={newPay.description}
                    onChange={e => setNewPay({...newPay, description: e.target.value})}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input 
                      type="number" step="0.01" required
                      placeholder="0,00"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={newPay.amount || ''}
                      onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Pagamento</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newPay.date}
                    onChange={e => setNewPay({...newPay, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newPay.dueDate}
                    onChange={e => setNewPay({...newPay, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PAID', 'PENDING', 'OVERDUE'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewPay({...newPay, status: s})}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${
                        newPay.status === s 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                      }`}
                    >
                      {statusStyles[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex flex-col md:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="order-2 md:order-1 flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="order-1 md:order-2 flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Recibo */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
              <h3 className="font-black text-slate-900">Prévia do Recibo</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={() => setIsReceiptOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ÁREA DO RECIBO */}
            <div id="printable-receipt" className="p-10 md:p-16 text-slate-800 bg-white relative">
              {/* Marca d'água discreta */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12">
                <GraduationCap size={400} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl">
                      <GraduationCap className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tighter uppercase">EduBoost</h1>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escola de Reforço Escolar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-900 mb-1">RECIBO</h2>
                    <p className="text-sm font-bold text-slate-400">Nº {selectedPayment.id.padStart(6, '0')}</p>
                  </div>
                </div>

                <div className="space-y-8 mb-16">
                  <div className="flex items-baseline gap-4 border-b border-slate-100 pb-2">
                    <span className="text-xs font-black uppercase text-slate-400 shrink-0">Valor:</span>
                    <span className="text-2xl font-black text-slate-900">{formatCurrency(selectedPayment.amount)}</span>
                  </div>

                  <p className="text-lg leading-relaxed">
                    Recebemos de <span className="font-black border-b-2 border-slate-200">{getStudentName(selectedPayment.studentId)}</span>, 
                    a quantia supramencionada referente a <span className="font-black italic">{selectedPayment.description}</span>, 
                    pelo que firmamos o presente recibo dando plena quitação.
                  </p>

                  <div className="flex flex-col gap-1 text-sm text-slate-500">
                    <p className="font-bold flex items-center gap-2">
                      <CalendarIcon size={14} /> 
                      Data do Pagamento: <span className="text-slate-900">{formatDateWithTime(selectedPayment.paymentDate)}</span>
                    </p>
                    <p className="text-[10px] uppercase font-black tracking-widest mt-2">Local de Emissão: São Paulo - SP</p>
                  </div>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="text-center">
                    <div className="border-t-2 border-slate-900 pt-4">
                      <p className="text-xs font-black uppercase tracking-widest">Responsável EduBoost</p>
                      <p className="text-[10px] text-slate-400">CNPJ: 00.000.000/0001-00</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-black uppercase tracking-widest">Assinatura do Pagador</p>
                    </div>
                  </div>
                </div>

                <div className="mt-20 pt-8 border-t border-slate-50 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Obrigado pela confiança em nosso trabalho pedagógico</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
