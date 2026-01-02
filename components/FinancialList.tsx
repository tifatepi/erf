
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

    const opt = {
      margin: [10, 10, 10, 10], // Margens de 1cm em todas as bordas para segurança de impressão
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 4, // Escala 4x para ultra nitidez em textos e vetores
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: 'avoid-all' }
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

      {/* Modal Recibo - Otimizado para Página Única A4 (Estilo Premium Fintech) */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/20 my-8">
            <div className="p-6 md:p-8 border-b border-slate-300 flex items-center justify-between bg-white/90">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight text-slate-900">Documento de Recebimento</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Renderização Digital High-Fidelity</p>
                </div>
              </div>
              <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-slate-200 p-2 rounded-2xl transition-all text-slate-500">
                <X size={28} />
              </button>
            </div>

            <div className="p-4 md:p-12 bg-slate-300 flex justify-center overflow-x-auto">
              {/* O PAPEL (A4) - Visualização 1:1 com a impressão final */}
              <div 
                ref={receiptRef}
                className="bg-white shadow-2xl"
                style={{ 
                  width: '210mm', // Exato A4 largura
                  height: '297mm', // Exato A4 altura
                  backgroundColor: '#ffffff',
                  fontFamily: "'Inter', sans-serif",
                  color: '#1e293b',
                  padding: '40mm 20mm 20mm 20mm', // Margens amplas e clássicas
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Elementos Estéticos Superiores */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '15mm', backgroundColor: '#f8fafc' }}></div>
                <div style={{ position: 'absolute', top: '15mm', left: 0, width: '4mm', height: '80mm', backgroundColor: '#4f46e5' }}></div>
                
                {/* Header Institucional */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40mm' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ backgroundColor: '#4f46e5', padding: '16px', borderRadius: '18px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)' }}>
                      <GraduationCap style={{ color: '#ffffff' }} size={36} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#111827', margin: '0', letterSpacing: '-0.05em', lineHeight: '1' }}>EduBoost</h2>
                      <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#6366f1', margin: '8px 0 0 0', letterSpacing: '0.15em' }}>Inteligência Educacional</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ backgroundColor: '#111827', padding: '8px 16px', borderRadius: '12px', display: 'inline-block', marginBottom: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', margin: '0', letterSpacing: '0.1em' }}>Comprovante de Operação</p>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: '#111827', margin: '0', letterSpacing: '-0.02em' }}>Nº {selectedPayment.id.slice(0, 10).toUpperCase()}</p>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', margin: '4px 0 0 0' }}>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Bloco de Valor Central (O "Foco" do Fintech) */}
                <div style={{ border: '2px solid #f1f5f9', borderRadius: '32px', padding: '40mm 0', textAlign: 'center', marginBottom: '40mm', backgroundColor: '#fcfdfe', position: 'relative' }}>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px', margin: '0' }}>Valor Líquido Recebido</p>
                  <h1 style={{ fontSize: '72px', fontWeight: '950', color: '#111827', margin: '0', letterSpacing: '-0.04em' }}>{formatCurrency(selectedPayment.amount)}</h1>
                  
                  {/* Selo de Autenticidade Flutuante */}
                  <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.1 }}>
                     <QrCode size={100} />
                  </div>
                </div>

                {/* Conteúdo Descritivo Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60mm' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Favorecido / Aluno</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{getStudentName(selectedPayment.studentId)}</p>
                  </div>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Referente à</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.description}</p>
                  </div>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Data de Quitação</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                  </div>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Vencimento Original</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{new Date(selectedPayment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Assinaturas e Validadores */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '20mm' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '80%', borderBottom: '2px solid #111827', marginBottom: '20px' }}></div>
                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#111827', margin: '0' }}>EduBoost Reforço Escolar</p>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '4px 0 0 0' }}>Departamento de Controladoria e Finanças</p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>CNPJ: 00.000.000/0001-00</p>
                  </div>
                  
                  <div style={{ transform: 'rotate(-4deg)', border: '4px solid #10b981', padding: '15px 30px', borderRadius: '24px', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1)' }}>
                    <ShieldCheck size={32} />
                    <p style={{ fontSize: '24px', fontWeight: '950', margin: '5px 0 0 0', letterSpacing: '0.15em' }}>PAGO</p>
                    <p style={{ fontSize: '10px', fontWeight: '800', margin: '2px 0 0 0', opacity: 0.8 }}>VIA SISTEMA</p>
                  </div>
                </div>

                {/* Rodapé do Recibo - Autenticidade Digital */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '15px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Este é um documento digital com validade jurídica conforme MP 2.200-2/2001. A autenticidade pode ser verificada via QR Code.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white border-t border-slate-300 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsReceiptOpen(false)} 
                className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all border border-slate-200"
              >
                Voltar à Lista
              </button>
              
              <button 
                onClick={() => window.print()}
                className="px-8 py-4 bg-white text-slate-700 rounded-2xl text-sm font-black hover:bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Printer size={20} />
                Impressão Direta
              </button>

              <button 
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )}
                {isGeneratingPDF ? 'Finalizando PDF...' : 'Salvar Comprovante (PDF)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialList;
