
import React, { useState, useRef } from 'react';
import { Payment, Student } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  DollarSign, 
  X, 
  FileText, 
  Loader2,
  HandCoins,
  RotateCcw,
  Download,
  GraduationCap,
  ShieldCheck,
  QrCode,
  PlusCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { timeService } from '../services/timeService';

interface FinancialListProps {
  payments: Payment[];
  students: Student[];
  onAddPayment: (payment: Partial<Payment>) => Promise<void>;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
}

const FinancialList: React.FC<FinancialListProps> = ({ payments, students, onAddPayment, onUpdatePayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Usa a data oficial do TimeService
  const todayISO = timeService.todayISO();
  
  const [newPay, setNewPay] = useState({ 
    studentId: '', 
    amount: 0, 
    description: 'Janeiro', 
    date: todayISO,
    dueDate: todayISO,
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
      setNewPay({ studentId: '', amount: 0, description: 'Janeiro', date: todayISO, dueDate: todayISO, status: 'PENDING' });
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message || 'Erro na comunicação com o servidor'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPaid = async (payment: Payment) => {
    if (!window.confirm(`Deseja registrar o pagamento de ${getStudentName(payment.studentId)}?`)) return;
    try {
      await onUpdatePayment(payment.id, {
        status: 'PAID',
        paymentDate: todayISO
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

    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("Biblioteca de PDF não carregada.");
      return;
    }

    setIsGeneratingPDF(true);
    
    const element = receiptRef.current;
    const studentName = getStudentName(selectedPayment?.studentId || '');
    const fileName = `recibo-${studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => setIsGeneratingPDF(false))
      .catch(() => {
        alert("Erro ao gerar PDF.");
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
          <p className="text-slate-500 font-medium text-sm">Controle preciso de recebimentos e mensalidades.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95 group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Registrar Cobrança
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar aluno ou referência..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Registrar Cobrança</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Lançamento de mensalidade manual</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno Beneficiário</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
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
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mês de Referência</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer" 
                    value={newPay.description.replace('Mensalidade ', '')} 
                    onChange={e => setNewPay({...newPay, description: e.target.value})}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor da Parcela</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                    <input 
                      type="number" step="0.01" required 
                      className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={newPay.amount || ''} 
                      onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Vencimento</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" required 
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newPay.dueDate} 
                    onChange={e => setNewPay({...newPay, dueDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processando...' : 'Gerar Cobrança'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recibo - Mantido como estava */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/10 my-8">
            <div className="p-6 md:p-8 border-b border-slate-700 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl text-white"><FileText size={20} /></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">Recibo Digital</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ajustado para Folha A4</p>
                </div>
              </div>
              <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="p-4 md:p-8 bg-slate-700 flex justify-center items-center overflow-x-auto min-h-[70vh]">
              <div 
                ref={receiptRef}
                style={{ 
                  width: '210mm', height: '297mm', minHeight: '297mm', maxHeight: '297mm',
                  backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif", color: '#1e293b',
                  padding: '20mm', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
                  display: 'flex', flexDirection: 'column'
                }}
                className="pdf-canvas shadow-2xl"
              >
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '8mm', marginBottom: '10mm' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#4f46e5', padding: '10px', borderRadius: '12px' }}>
                      <GraduationCap style={{ color: '#ffffff' }} size={28} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0', letterSpacing: '-0.04em' }}>EduBoost</h2>
                      <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#6366f1', margin: '2px 0 0 0', letterSpacing: '0.1em' }}>Gestão de Reforço Escolar</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', margin: '0' }}>Número do Documento</p>
                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#111827', margin: '2px 0 0 0' }}># {selectedPayment.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Amount Section */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '10mm', textAlign: 'center', marginBottom: '12mm', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', margin: '0' }}>Recebemos o valor de</p>
                  <h1 style={{ fontSize: '48px', fontWeight: '950', color: '#4f46e5', margin: '0', letterSpacing: '-0.03em' }}>{formatCurrency(selectedPayment.amount)}</h1>
                </div>

                {/* Main Content Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15mm' }}>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: '0' }}>Beneficiário / Aluno</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0' }}>{getStudentName(selectedPayment.studentId)}</p>
                  </div>

                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: '0' }}>Referente ao Serviço de</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0' }}>{selectedPayment.description}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20mm' }}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: '0' }}>Data do Pagamento</p>
                      <p style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0' }}>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                    </div>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: '0' }}>Vencimento</p>
                      <p style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0' }}>{new Date(selectedPayment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '12mm', fontSize: '13px', lineHeight: '1.6', color: '#475569', backgroundColor: '#f1f5f9', padding: '8mm', borderRadius: '14px', fontStyle: 'italic' }}>
                  Pelo presente, declaramos ter recebido a importância supra descrita, para a qual damos a devida e irrevogável quitação.
                </div>

                <div style={{ flex: 1 }}></div>

                <div style={{ paddingBottom: '5mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10mm' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '80%', borderBottom: '2px solid #1e293b', marginBottom: '8px' }}></div>
                      <p style={{ fontSize: '12px', fontWeight: '900', color: '#1e293b', margin: '0' }}>EduBoost Gestão de Reforço Escolar</p>
                      <p style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', margin: '2px 0 0 0' }}>Autenticação: {selectedPayment.id.toUpperCase()}</p>
                    </div>
                    <div style={{ textAlign: 'center', opacity: 0.8 }}>
                      <QrCode size={64} style={{ color: '#1e293b', marginBottom: '4px' }} />
                      <p style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', margin: '0' }}>Validar Autenticidade</p>
                    </div>
                  </div>
                  <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '6mm', textAlign: 'center' }}>
                    <p style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0' }}>
                      EduBoost Educação Ltda • CNPJ: 00.000.000/0001-00 • Contato: (00) 00000-0000
                    </p>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '100mm', right: '15mm', transform: 'rotate(-10deg)', border: '3px solid #10b981', padding: '8px 20px', borderRadius: '12px', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', opacity: 0.7 }}>
                  <ShieldCheck size={24} />
                  <p style={{ fontSize: '16px', fontWeight: '950', margin: '2px 0 0 0' }}>CONFIRMADO</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setIsReceiptOpen(false)} className="flex-1 px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl text-sm font-black hover:bg-slate-700 transition-all">Fechar</button>
              <button 
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-70"
              >
                {isGeneratingPDF ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {isGeneratingPDF ? 'Formatando...' : 'Baixar Recibo (PDF A4)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
