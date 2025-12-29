
import React, { useState, useRef } from 'react';
import { Payment, Student } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  DollarSign, 
  X, 
  Calendar as CalendarIcon, 
  Save, 
  FileText, 
  Printer, 
  GraduationCap,
  Share2,
  Loader2,
  HandCoins,
  RotateCcw,
  Download
} from 'lucide-react';

interface FinancialListProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (payment: Partial<Payment>) => Promise<void>;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
}

declare const html2pdf: any;

const FinancialList: React.FC<FinancialListProps> = ({ payments, students, onAddPayment, onUpdatePayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [newPay, setNewPay] = useState({ 
    studentId: '', 
    amount: 0, 
    description: 'Janeiro', 
    date: today,
    dueDate: today,
    status: 'PENDING' as 'PAID' | 'PENDING' | 'OVERDUE'
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getStudent = (id: string) => students.find(s => String(s.id) === String(id));
  const getStudentName = (id: string) => getStudent(id)?.name || 'Desconhecido';

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
        paymentDate: newPay.status === 'PAID' ? newPay.date : undefined,
        description: `Mensalidade ${newPay.description}`,
        status: newPay.status
      });
      setIsModalOpen(false);
      setNewPay({ studentId: '', amount: 0, description: 'Janeiro', date: today, dueDate: today, status: 'PENDING' });
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message || 'Verifique se as colunas existem no banco'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPaid = async (payment: Payment) => {
    if (!window.confirm(`Deseja registrar o pagamento de ${getStudentName(payment.studentId)}?`)) return;
    try {
      await onUpdatePayment(payment.id, {
        status: 'PAID',
        paymentDate: today
      });
    } catch (err) {
      alert("Erro ao atualizar pagamento.");
    }
  };

  const handleSetPending = async (payment: Payment) => {
    if (!window.confirm(`Deseja estornar este pagamento e torná-lo PENDENTE?`)) return;
    try {
      await onUpdatePayment(payment.id, {
        status: 'PENDING',
        paymentDate: undefined
      });
    } catch (err) {
      alert("Erro ao estornar pagamento.");
    }
  };

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const downloadPDF = () => {
    if (!receiptRef.current) return;
    setIsGeneratingPDF(true);
    
    const element = receiptRef.current;
    const opt = {
      margin: 10,
      filename: `recibo-${getStudentName(selectedPayment?.studentId || '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().finally(() => {
      setIsGeneratingPDF(false);
    });
  };

  const filteredPayments = payments.filter(p => 
    getStudentName(p.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Fluxo Financeiro</h2>
          <p className="text-slate-500 font-medium text-sm">Gerenciamento completo de receitas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <DollarSign size={18} />
          Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar aluno ou referência..." 
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredPayments.map((payment) => {
                const style = statusStyles[payment.status] || statusStyles.PENDING;
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
                          {style.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {payment.status === 'PAID' ? (
                          <>
                            <button 
                              onClick={() => handleOpenReceipt(payment)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Ver Recibo"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => handleSetPending(payment)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Tornar Pendente"
                            >
                              <RotateCcw size={18} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleSetPaid(payment)}
                            className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90 flex items-center gap-2 text-[10px] font-black uppercase"
                          >
                            <HandCoins size={14} />
                            Receber
                          </button>
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

      {/* Modal Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="font-black text-2xl tracking-tight">Novo Lançamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newPay.studentId}
                  onChange={e => {
                    const student = students.find(s => String(s.id) === e.target.value);
                    setNewPay({...newPay, studentId: e.target.value, amount: student?.monthlyFee || 0});
                  }}
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mês Ref.</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPay.description}
                    onChange={e => setNewPay({...newPay, description: e.target.value})}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPay.amount || ''}
                    onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value)})}
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
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {statusStyles[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-[11px] font-black uppercase tracking-widest ml-1 ${newPay.status === 'PAID' ? 'text-slate-400' : 'text-slate-200'}`}>Data Pagamento</label>
                  <input 
                    type="date" 
                    disabled={newPay.status !== 'PAID'}
                    className={`w-full px-5 py-4 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${newPay.status === 'PAID' ? 'bg-slate-50' : 'bg-slate-100 cursor-not-allowed opacity-40'}`}
                    value={newPay.status === 'PAID' ? newPay.date : ''}
                    onChange={e => setNewPay({...newPay, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPay.dueDate}
                    onChange={e => setNewPay({...newPay, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  {isSubmitting ? 'Salvando...' : 'Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-black text-xl tracking-tight">Visualização do Recibo</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Recibo de Pagamento de Serviço</p>
              </div>
              <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-8 overflow-y-auto max-h-[60vh] custom-scrollbar bg-slate-100">
              <div 
                ref={receiptRef}
                className="bg-white p-8 md:p-12 shadow-sm rounded-lg border border-slate-200 mx-auto max-w-full font-serif text-slate-800"
                style={{ width: '210mm', minHeight: '148mm' }}
              >
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                  <div>
                    <h2 className="text-3xl font-black italic text-indigo-600 tracking-tighter">EduBoost</h2>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mt-1">Escola de Reforço Escolar</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">RECIBO Nº {selectedPayment.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xl font-black text-indigo-600">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>

                <div className="space-y-6 text-base leading-relaxed">
                  <p>
                    Recebemos de <span className="font-bold border-b border-slate-400 px-2">{getStudentName(selectedPayment.studentId)}</span>, 
                    a quantia de <span className="font-bold border-b border-slate-400 px-2">{formatCurrency(selectedPayment.amount)}</span> 
                    referente a <span className="font-bold border-b border-slate-400 px-2">{selectedPayment.description}</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-8 mt-12">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Data do Pagamento</p>
                      <p className="font-bold border-b border-slate-200 pb-2">
                        {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' }) : '---'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Local</p>
                      <p className="font-bold border-b border-slate-200 pb-2">Cidade do Aluno, Brasil</p>
                    </div>
                  </div>

                  <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center">
                    <div className="w-64 border-b-2 border-slate-800 mb-2"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-800">Assinatura da Coordenação</p>
                    <p className="text-[10px] text-slate-400 mt-1">EduBoost Reforço Escolar - CNPJ: 00.000.000/0001-00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsReceiptOpen(false)} 
                className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all"
              >
                Fechar
              </button>
              <button 
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )}
                {isGeneratingPDF ? 'Gerando...' : 'Baixar Recibo PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
