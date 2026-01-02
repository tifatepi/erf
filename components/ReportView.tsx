
import React, { useState, useRef } from 'react';
import { Payment, Student, Turma } from '../types';
import { FileBarChart, Download, Loader2, Calendar, TrendingUp, DollarSign, Users, GraduationCap, QrCode } from 'lucide-react';

interface ReportViewProps {
  payments: Payment[];
  students: Student[];
  turmas: Turma[];
}

const ReportView: React.FC<ReportViewProps> = ({ payments, students, turmas }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const reportRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const monthlyPayments = payments.filter(p => {
    const date = new Date(p.dueDate);
    return (date.getMonth() + 1) === reportMonth;
  });

  const totalBilled = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = monthlyPayments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = totalBilled - totalPaid;

  const downloadPDF = () => {
    if (!reportRef.current) return;
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) return;

    setIsGenerating(true);
    const opt = {
      margin: 0,
      filename: `Relatorio-Financeiro-${months[reportMonth-1]}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(reportRef.current).set(opt).save().then(() => setIsGenerating(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Relatórios</h2>
          <p className="text-slate-500 font-medium">Análise de dados e exportação de documentos.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <select 
            value={reportMonth}
            onChange={(e) => setReportMonth(Number(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer px-4"
          >
            {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Visualização Prévia do Relatório */}
      <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-white/5 flex justify-center overflow-x-auto">
        <div 
          ref={reportRef}
          style={{ 
            width: '210mm', height: '297mm', padding: '20mm', backgroundColor: '#fff', 
            color: '#1e293b', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' 
          }}
          className="shadow-2xl font-sans"
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '8mm', marginBottom: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: '#4f46e5', padding: '10px', borderRadius: '12px' }}>
                <GraduationCap color="#fff" size={32} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>EduBoost Reports</h1>
                <p style={{ margin: 0, fontSize: '10px', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase' }}>Consolidado Mensal de Gestão</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>REFERÊNCIA</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>{months[reportMonth-1].toUpperCase()} / 2024</p>
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10mm', marginBottom: '15mm' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px 20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', margin: '0 0 5px 0' }}>TOTAL FATURADO</p>
              <p style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{formatCurrency(totalBilled)}</p>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px 20px', borderRadius: '16px', border: '1px solid #dcfce7' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', color: '#16a34a', margin: '0 0 5px 0' }}>TOTAL RECEBIDO</p>
              <p style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', margin: 0 }}>{formatCurrency(totalPaid)}</p>
            </div>
            <div style={{ backgroundColor: '#fff1f2', padding: '10px 20px', borderRadius: '16px', border: '1px solid #ffe4e6' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', color: '#e11d48', margin: '0 0 5px 0' }}>PENDÊNCIAS</p>
              <p style={{ fontSize: '20px', fontWeight: '900', color: '#e11d48', margin: 0 }}>{formatCurrency(totalPending)}</p>
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '15px', color: '#1e293b', borderLeft: '4px solid #4f46e5', paddingLeft: '10px' }}>Detalhamento de Lançamentos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #f1f5f9', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Aluno</th>
                  <th style={{ padding: '10px' }}>Descrição</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {monthlyPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{students.find(s => s.id === p.studentId)?.name}</td>
                    <td style={{ padding: '10px' }}>{p.description}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '8px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', backgroundColor: p.status === 'PAID' ? '#dcfce7' : '#fee2e2', color: p.status === 'PAID' ? '#166534' : '#991b1b' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800' }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b', margin: 0 }}>EduBoost School Management</p>
              <p style={{ fontSize: '8px', color: '#94a3b8', margin: '2px 0 0 0' }}>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <QrCode size={40} style={{ color: '#94a3b8' }} />
               <p style={{ fontSize: '6px', fontWeight: '900', color: '#94a3b8', marginTop: '4px' }}>AUTENTICIDADE DIGITAL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
