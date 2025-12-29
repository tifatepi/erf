
import React, { useState } from 'react';
import { Search, Plus, MessageSquareCode, X, Edit, Save, DollarSign } from 'lucide-react';
import { getAcademicInsights } from '../services/geminiService';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Partial<Student>) => Promise<void>;
  onUpdateStudent: (id: string, student: Partial<Student>) => Promise<void>;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onUpdateStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    grade: '',
    school: '',
    monthlyFee: 0,
    subjects: [] as string[]
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleGetAiInsight = async (student: Student) => {
    setLoadingAi(true);
    const age = calculateAge(student.birthDate);
    const dataString = `Aluno: ${student.name}, Idade: ${age}, Série: ${student.grade}, Matérias: ${student.subjects?.join(', ') || 'Nenhuma'}`;
    const result = await getAcademicInsights(dataString);
    setAiInsight(result);
    setLoadingAi(false);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', birthDate: '', grade: '', school: '', monthlyFee: 0, subjects: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      birthDate: student.birthDate || '',
      grade: student.grade,
      school: student.school,
      monthlyFee: student.monthlyFee || 0,
      subjects: student.subjects || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects.length > 0 ? formData.subjects : ['Reforço Geral']
      };

      if (editingStudent) {
        await onUpdateStudent(editingStudent.id, payload);
      } else {
        await onAddStudent(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Alunos</h2>
          <p className="text-slate-500 font-medium text-sm">Administre o corpo discente com facilidade.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <Plus size={18} />
          Novo Aluno
        </button>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 text-white p-6 rounded-3xl flex flex-col md:flex-row items-start gap-4 shadow-2xl relative animate-in slide-in-from-top duration-500">
          <div className="bg-white/20 p-3 rounded-2xl shrink-0"><MessageSquareCode size={24} /></div>
          <div className="flex-1 pr-8">
            <h4 className="font-black text-lg mb-1">Insight da IA</h4>
            <p className="text-indigo-50 text-sm font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button onClick={() => setAiInsight(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome do aluno..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 md:px-8 py-5">Aluno / Idade</th>
                <th className="px-6 md:px-8 py-5">Série / Escola</th>
                <th className="px-6 md:px-8 py-5">Mensalidade</th>
                <th className="px-6 md:px-8 py-5">Disciplinas</th>
                <th className="px-6 md:px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100 shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{student.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{calculateAge(student.birthDate)} ANOS</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <p className="text-sm font-black text-slate-700">{student.grade}</p>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[180px]">{student.school}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <p className="text-sm font-black text-indigo-600">{formatCurrency(student.monthlyFee)}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {student.subjects?.map((sub, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border border-indigo-100">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleGetAiInsight(student)} 
                          disabled={loadingAi}
                          className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-90 disabled:opacity-50" 
                          title="IA Insight"
                        >
                          <MessageSquareCode size={20} />
                        </button>
                        <button 
                          onClick={() => openEditModal(student)} 
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90" 
                          title="Editar"
                        >
                          <Edit size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Search size={48} />
                      <p className="mt-4 font-black uppercase text-xs tracking-widest">Nenhum aluno encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white sticky top-0 z-10">
              <div>
                <h3 className="font-black text-2xl tracking-tight">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Ficha de matrícula</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nascimento</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Série</label>
                  <input 
                    type="text" required
                    placeholder="Ex: 8º Ano"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Escola</label>
                  <input 
                    type="text"
                    placeholder="Nome da instituição"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.school}
                    onChange={e => setFormData({...formData, school: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Mensalidade</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" step="0.01" required
                      placeholder="0,00"
                      className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.monthlyFee || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setFormData({...formData, monthlyFee: isNaN(val) ? 0 : val});
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="order-1 sm:order-2 flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                  {isSubmitting ? 'Processando...' : 'Confirmar Dados'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
