
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Payment, Student, Turma, AttendanceRecord } from '../types';
import { db } from '../services/supabaseService';
import { 
  FileBarChart, 
  Download, 
  Loader2, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  GraduationCap, 
  QrCode, 
  FileSpreadsheet, 
  ClipboardCheck,
  Shapes,
  UserCheck
} from 'lucide-react';

interface ReportViewProps {
  payments: Payment[];
  students: Student[];
  turmas: Turma[];
}

const ReportView: React.FC<ReportViewProps> = ({ payments, students, turmas }) => {
  const [activeSubTab, setActiveSubTab] = useState<'FINANCIAL' | 'ATTENDANCE'>('FINANCIAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(turmas[0]?.id || '');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (activeSubTab === 'ATTENDANCE') {
      loadAttendanceData();
    }
  }, [activeSubTab]);

  const loadAttendanceData = async () => {
    setLoadingData(true);
    try {
      const data = await db.attendance.list();
      setAttendanceRecords(data);
    } catch (err) {
      console.error("Erro ao carregar frequências:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Lógica Financeira
  const monthlyPayments = useMemo(() => payments.filter(p => {
    const date = new Date(p.dueDate);
    return (date.getMonth() + 1) === reportMonth;
  }), [payments, reportMonth]);

  const totalBilled = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = monthlyPayments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = totalBilled - totalPaid;

  // Lógica de Frequência
  const attendanceStats = useMemo(() => {
    if (!selectedTurmaId) return [];
    
    const turma = turmas.find(t => t.id === selectedTurmaId);
    if (!turma) return [];

    const records = attendanceRecords.filter(r => r.turmaId === selectedTurmaId);
    const totalClasses = records.length;

    return turma.studentIds.map(sid => {
      const student = students.find(s => s.id === sid);
      const presences = records.filter(r => r.presentStudentIds.includes(sid)).length;
      const percentage = totalClasses > 0 ? (presences / totalClasses) * 100 : 0;
      
      return {
        id: sid,
        name: student?.name || 'Desconhecido',
        totalClasses,
        presences,
        absences: totalClasses - presences,
        percentage: percentage.toFixed(1)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedTurmaId, attendanceRecords, students, turmas]);

  const downloadPDF = () => {
    if (!reportRef.current) return;
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) return;

    setIsGenerating(true);
    const fileName = activeSubTab === 'FINANCIAL' 
      ? `Relatorio-Financeiro-${months[reportMonth-1]}.pdf`
      : `Relatorio-Frequencia-${turmas.find(t => t.id === selectedTurmaId)?.name || 'Turma'}.pdf`;

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(reportRef.current).set(opt).save().then(() => setIsGenerating(false));
  };

  const downloadXLSX = () => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) return;

    let data: any[] = [];
    let fileName = "";

    if (activeSubTab === 'FINANCIAL') {
      fileName = `Financeiro-${months[reportMonth-1]}.xlsx`;
      data = monthlyPayments.map(p => ({
        Aluno: students.find(s => s.id === p.studentId)?.name,
        Referência: p.description,
        Status: p.status,
        Valor: p.amount,
        Vencimento: p.dueDate
      }));
    } else {
      fileName = `Frequencia-${turmas.find(t => t.id === selectedTurmaId)?.name || 'Turma'}.xlsx`;
      data = attendanceStats.map(s => ({
        Aluno: s.name,
        'Aulas Totais': s.totalClasses,
        Presenças: s.presences,
        Faltas: s.absences,
        'Frequência %': s.percentage + '%'
      }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Relatórios</h2>
          <p className="text-slate-500 font-medium">Análise de dados e exportação de documentos oficiais.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
             <button 
               onClick={() => setActiveSubTab('FINANCIAL')}
               className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeSubTab === 'FINANCIAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <DollarSign size={14} /> Financeiro
             </button>
             <button 
               onClick={() => setActiveSubTab('ATTENDANCE')}
               className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeSubTab === 'ATTENDANCE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <UserCheck size={14} /> Frequência
             </button>
          </div>

          <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={downloadXLSX}
              className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100"
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        {activeSubTab === 'FINANCIAL' ? (
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-500" size={18} />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Competência:</span>
            <select 
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              className="bg-slate-50 border-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2"
            >
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Shapes className="text-indigo-500" size={18} />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filtrar Turma:</span>
            <select 
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 flex-1"
            >
              <option value="">Selecione uma turma...</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Visualização Prévia do Relatório (Folha A4) */}
      <div className="bg-slate-800 p-4 md:p-12 rounded-[2.5rem] border border-white/5 flex justify-center overflow-x-auto custom-scrollbar">
        {loadingData ? (
          <div className="h-[297mm] w-[210mm] bg-white flex flex-col items-center justify-center rounded-xl shadow-2xl">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Processando Informações...</p>
          </div>
        ) : (
          <div 
            ref={reportRef}
            style={{ 
              width: '210mm', height: '297mm', minHeight: '297mm', maxHeight: '297mm', padding: '20mm', 
              backgroundColor: '#fff', color: '#1e293b', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' 
            }}
            className="shadow-2xl font-sans"
          >
            {/* Header Oficial */}
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '8mm', marginBottom: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ backgroundColor: '#4f46e5', padding: '12px', borderRadius: '14px' }}>
                  <GraduationCap color="#fff" size={32} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '950', letterSpacing: '-0.04em' }}>EduBoost</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {activeSubTab === 'FINANCIAL' ? 'Relatório de Caixa Mensal' : 'Relatório de Engajamento Discente'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Documento Emitido em</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '900' }}>{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Conteúdo Financeiro */}
            {activeSubTab === 'FINANCIAL' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10mm', marginBottom: '15mm' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Faturado Total</p>
                    <p style={{ fontSize: '22px', fontWeight: '950', color: '#1e293b', margin: 0 }}>{formatCurrency(totalBilled)}</p>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '16px', border: '1px solid #dcfce7' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#16a34a', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Total Recebido</p>
                    <p style={{ fontSize: '22px', fontWeight: '950', color: '#16a34a', margin: 0 }}>{formatCurrency(totalPaid)}</p>
                  </div>
                  <div style={{ backgroundColor: '#fff1f2', padding: '15px', borderRadius: '16px', border: '1px solid #ffe4e6' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#e11d48', margin: '0 0 5px 0', textTransform: 'uppercase' }}>A Receber</p>
                    <p style={{ fontSize: '22px', fontWeight: '950', color: '#e11d48', margin: 0 }}>{formatCurrency(totalPending)}</p>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '15px', color: '#1e293b', borderLeft: '4px solid #4f46e5', paddingLeft: '10px', textTransform: 'uppercase' }}>Extrato de Movimentações - {months[reportMonth-1]}</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '12px 10px' }}>Aluno</th>
                        <th style={{ padding: '12px 10px' }}>Referência</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>Situação</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right' }}>Valor Bruto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPayments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '700' }}>{students.find(s => s.id === p.studentId)?.name}</td>
                          <td style={{ padding: '12px 10px', color: '#64748b' }}>{p.description}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{ fontSize: '8px', fontWeight: '950', padding: '3px 10px', borderRadius: '50px', backgroundColor: p.status === 'PAID' ? '#dcfce7' : '#fee2e2', color: p.status === 'PAID' ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
                              {p.status === 'PAID' ? 'Liquidado' : 'Em Aberto'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '900', color: '#1e293b' }}>{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Conteúdo de Frequência */}
            {activeSubTab === 'ATTENDANCE' && (
              <>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px 25px', borderRadius: '20px', border: '1px solid #f1f5f9', marginBottom: '12mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Turma Selecionada</p>
                      <h4 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b', margin: 0 }}>{turmas.find(t => t.id === selectedTurmaId)?.name || 'Nenhuma Turma'}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Disciplina</p>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#4f46e5', margin: 0 }}>{turmas.find(t => t.id === selectedTurmaId)?.subject || '---'}</p>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '20px', color: '#1e293b', borderLeft: '4px solid #4f46e5', paddingLeft: '10px', textTransform: 'uppercase' }}>Consolidado de Presença</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '12px 10px' }}>Estudante</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>Aulas</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>Presenças</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>Faltas</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right' }}>Frequência %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceStats.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '700' }}>{s.name}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748b' }}>{s.totalClasses}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>{s.presences}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'center', color: '#e11d48', fontWeight: '700' }}>{s.absences}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '900', 
                              color: Number(s.percentage) >= 75 ? '#166534' : '#991b1b',
                              backgroundColor: Number(s.percentage) >= 75 ? '#f0fdf4' : '#fef2f2',
                              padding: '4px 8px',
                              borderRadius: '8px'
                            }}>
                              {s.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendanceStats.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                            Nenhum registro encontrado para esta turma.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer e Autenticação */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', margin: 0 }}>EduBoost School Management System</p>
                <p style={{ fontSize: '9px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '600' }}>Este documento possui validade institucional para controle acadêmico interno.</p>
              </div>
              <div style={{ textAlign: 'center', opacity: 0.6 }}>
                 <QrCode size={45} style={{ color: '#1e293b' }} />
                 <p style={{ fontSize: '7px', fontWeight: '900', color: '#1e293b', marginTop: '6px', textTransform: 'uppercase' }}>Autenticação Digital</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;
