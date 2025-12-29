
import React, { useState } from 'react';
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
  Info, 
  FileText, 
  Printer, 
  GraduationCap,
  Share2,
  Loader2,
  HandCoins,
  History,
  RotateCcw
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

  const getStudentName = (id: string) => students.find(s => String(s.id) === String(id))?.name || 'Desconhecido';

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
        // Só envia paymentDate se o status inicial for PAID
        paymentDate: newPay.status === 'PAID' ? newPay.date : undefined,
        description: `Mensalidade ${newPay.description}`,
        status: newPay.status
      });
      setIsModalOpen(false);
      setNewPay({ studentId: '', amount: 0, description: 'Janeiro', date: today, dueDate: today, status: 'PENDING' });
    } catch (err) {
      alert("Erro ao salvar lançamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPaid = async (payment: Payment) => {
    const confirmPayment = window.confirm(`Confirmar recebimento de ${formatCurrency(payment.amount)} para ${getStudentName(payment.studentId)}?`);
    if (!confirmPayment) return;

    try {
      await onUpdatePayment(payment.id, {
        status: 'PAID',
        paymentDate: today
      });
    } catch (err) {
      alert("Erro ao liquidar pagamento.");
    }
  };

  const handleSetPending = async (payment: Payment) => {
    const confirmPending = window.confirm(`Deseja estornar este pagamento e torná-lo PENDENTE novamente?`);
    if (!confirmPending) return;

    try {
      await onUpdatePayment(payment.id, {
        status: 'PENDING',
        paymentDate: undefined // No Supabase isso deve limpar o campo
      });
    } catch (err) {
      alert("Erro ao atualizar para pendente.");
    }
  };

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSharePDF = async () => {
    if (!selectedPayment) return;
    
    setIsGeneratingPDF(true);
    const element = document.getElementById('printable-receipt');
    if (!element) {
      setIsGeneratingPDF(false);
      return;
    }

    const studentName = getStudentName(selectedPayment.studentId);
    const fileName = `Recibo_${studentName.replace(/\s+/g, '_')}_${selectedPayment.description.replace(/\s+/g, '_')}.pdf`;

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: 'Recibo de Pagamento - EduBoost',
          text: `Segue o recibo de pagamento de ${studentName} referente a ${selectedPayment.description}.`
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao gerar/compartilhar PDF:', error);
      alert('Houve um problema ao gerar o PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    getStudentName(p.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateWithTime = (dateStr?: string) => {
    if (!dateStr) return 'Não pago';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <style>{`
        #printable-receipt {
          background-color: #ffffff !important;
          color: #1e293b !important;
        }
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 40px;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Fluxo Financeiro</h2>
          <p className="text-slate-500 font-medium text-sm">Controle as mensalidades de forma eficiente.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <DollarSign size={18} />
          Novo Lançamento
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
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pendente</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(payments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0))}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="bg-rose-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Atrasado</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(payments.filter(p => p.status === 'OVERDUE').reduce((acc, p) => acc + p.amount, 0))}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por aluno ou mês..." 
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
                <th className="px-8 py-5">Dt. Pagamento</th>
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
                    <td className="px-8 py-5 font-bold text-indigo-600">
                      {payment.paymentDate ? new Date(payment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white rounded-t-[2.5rem]">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Novo Lançamento</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Gestão de Mensalidades</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
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
                    className={`w-full px-5 py-4 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${newPay.status === 'PAID' ? 'bg-slate-50' : 'bg-slate-100 cursor-not-allowed opacity-50'}`}
                    value={newPay.date}
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
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50">
                  {isSubmitting ? 'Gravando...' : 'Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
              <h3 className="font-black text-slate-900">Recibo #{selectedPayment.id}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleSharePDF} disabled={isGeneratingPDF} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                  {isGeneratingPDF ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Compartilhar
                </button>
                <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
                  <Printer size={14} /> Imprimir
                </button>
                <button onClick={() => setIsReceiptOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
              <div id="printable-receipt" className="text-slate-800 bg-white relative p-16 shadow-lg mx-auto max-w-[210mm]">
                <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl">
                      <GraduationCap className="text-white" size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">EduBoost</h1>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reforço Escolar Especializado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-900 mb-1">RECIBO</h2>
                    <p className="text-sm font-bold text-slate-400">ID Lançamento: {selectedPayment.id}</p>
                  </div>
                </div>

                <div className="space-y-8 mb-16">
                  <div className="flex items-baseline gap-4 border-b border-slate-100 pb-2">
                    <span className="text-xs font-black uppercase text-slate-400">Valor Recebido:</span>
                    <span className="text-2xl font-black text-slate-900">{formatCurrency(selectedPayment.amount)}</span>
                  </div>

                  <p className="text-lg leading-relaxed text-slate-700">
                    Declaramos para os devidos fins que recebemos de <span className="font-black border-b-2 border-slate-200 text-slate-900">{getStudentName(selectedPayment.studentId)}</span>, 
                    a importância supra referente ao pagamento de <span className="font-black italic text-slate-900">{selectedPayment.description}</span>.
                  </p>

                  <div className="flex flex-col gap-1 text-sm text-slate-500">
                    <p className="font-bold flex items-center gap-2">
                      <CalendarIcon size={14} className="text-indigo-400" /> 
                      Data da Operação: <span className="text-slate-900">{formatDateWithTime(selectedPayment.paymentDate)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-24 grid grid-cols-2 gap-12">
                  <div className="text-center">
                    <div className="border-t-2 border-slate-900 pt-4">
                      <p className="text-xs font-black uppercase tracking-widest">Responsável EduBoost</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-300">Carimbo / Assinatura</p>
                    </div>
                  </div>
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
