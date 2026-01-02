
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
  Printer,
  ChevronRight
} from 'lucide-react';

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

    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("Biblioteca de PDF não carregada. Verifique sua conexão.");
      return;
    }

    setIsGeneratingPDF(true);
    
    const element = receiptRef.current;
    const studentName = getStudentName(selectedPayment?.studentId || '');
    const fileName = `recibo-${studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    // Configuração refinada para 1 página A4 exata
    const opt = {
      margin: 0, // Zero margem na biblioteca pois usaremos margens reais no CSS (20mm)
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        setIsGeneratingPDF(false);
      })
      .catch((err: any) => {
        console.error("PDF Error:", err);
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
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <DollarSign size={18} />
          Registrar Pagamento
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
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno Beneficiário</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Referência Mensal</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPay.description}
                    onChange={e => setNewPay({...newPay, description: e.target.value})}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Título (R$)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newPay.amount || ''}
                    onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado do Lançamento</label>
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Vencimento</label>
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
                  {isSubmitting ? 'Processando...' : 'Efetuar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo - RIGOROSAMENTE AJUSTADO PARA A4 EM PÁGINA ÚNICA */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/10 my-8">
            <div className="p-6 md:p-8 border-b border-slate-700 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">Recibo de Pagamento</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Formato A4 Oficial (210x297mm)</p>
                </div>
              </div>
              <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="p-4 md:p-12 bg-slate-700 flex justify-center items-start overflow-x-auto min-h-[60vh]">
              {/* O PAPEL (A4) - ESTILIZAÇÃO TÉCNICA PARA IMPRESSÃO 1:1 */}
              <div 
                ref={receiptRef}
                style={{ 
                  width: '210mm',
                  height: '297mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                  backgroundColor: '#ffffff',
                  fontFamily: "'Inter', sans-serif",
                  color: '#1e293b',
                  padding: '25mm', // Margens padrão comercial
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between' // Distribui conteúdo para ocupar a página harmoniosamente
                }}
                className="pdf-canvas shadow-2xl"
              >
                {/* Cabeçalho */}
                <div style={{ marginBottom: '20mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '10mm' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ backgroundColor: '#4f46e5', padding: '12px', borderRadius: '14px' }}>
                        <GraduationCap style={{ color: '#ffffff' }} size={32} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: '0', letterSpacing: '-0.04em' }}>EduBoost</h2>
                        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6366f1', margin: '4px 0 0 0', letterSpacing: '0.1em' }}>Educação de Alta Performance</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', margin: '0' }}>Comprovante de Pagamento</p>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '2px 0 0 0' }}># {selectedPayment.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Corpo do Recibo */}
                <div style={{ flex: 1 }}>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '24px', padding: '15mm', textAlign: 'center', marginBottom: '15mm' }}>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px', margin: '0' }}>Recebemos o valor de</p>
                    <h1 style={{ fontSize: '64px', fontWeight: '950', color: '#4f46e5', margin: '0', letterSpacing: '-0.03em' }}>{formatCurrency(selectedPayment.amount)}</h1>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Proveniente de</p>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{getStudentName(selectedPayment.studentId)}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Referente à</p>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Data do Pagamento</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                      </div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Vencimento</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{new Date(selectedPayment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20mm', fontSize: '14px', lineHeight: '1.6', color: '#475569', backgroundColor: '#f1f5f9', padding: '10mm', borderRadius: '16px', fontStyle: 'italic' }}>
                    Confirmamos que o valor acima descrito foi devidamente creditado em nossa conta, quitando as obrigações financeiras referentes ao período mencionado.
                  </div>
                </div>

                {/* Rodapé e Assinaturas */}
                <div style={{ marginTop: '30mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15mm' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '85%', borderBottom: '2px solid #1e293b', marginBottom: '12px' }}></div>
                      <p style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', margin: '0' }}>EduBoost Gestão Escolar</p>
                      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', margin: '2px 0 0 0' }}>Autenticação Eletrônica: {selectedPayment.id.toUpperCase()}</p>
                    </div>
                    
                    <div style={{ textAlign: 'center', opacity: 0.8 }}>
                      <QrCode size={80} style={{ color: '#1e293b', marginBottom: '8px' }} />
                      <p style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Valide este recibo</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10mm', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      EduBoost Educação Ltda • CNPJ: 00.000.000/0001-00 • eduboost.com.br
                    </p>
                  </div>
                </div>

                {/* Selo Digital Flutuante */}
                <div style={{ position: 'absolute', top: '120mm', right: '15mm', transform: 'rotate(-15deg)', border: '4px solid #10b981', padding: '10px 25px', borderRadius: '16px', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', opacity: 0.8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  <ShieldCheck size={28} />
                  <p style={{ fontSize: '20px', fontWeight: '950', margin: '2px 0 0 0' }}>QUITADO</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsReceiptOpen(false)} 
                className="flex-1 px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl text-sm font-black hover:bg-slate-700 transition-all border border-slate-700"
              >
                Fechar Visualização
              </button>
              
              <button 
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )}
                {isGeneratingPDF ? 'Formatando Página...' : 'Baixar Recibo em PDF (A4)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
