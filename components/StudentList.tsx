
import React, { useState } from 'react';
import { Search, Plus, MessageSquareCode, X, Edit, Save } from 'lucide-react';
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
    subjects: [] as string[]
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setFormData({ name: '', birthDate: '', grade: '', school: '', subjects: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      birthDate: student.birthDate || '',
      grade: student.grade,
      school: student.school,
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
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <Plus size={18} />
          Novo Aluno
        </button>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 text-white p-6 rounded-3xl flex flex-col md:flex-row items-start gap-4 shadow-2xl relative animate-fade-in">
          <div className="bg-white/20 p-3 rounded-2xl shrink-0"><MessageSquareCode size={24} /></div>
          <div className="flex-1 pr-8">
            <h4 className="font-black text-lg mb-1">Insight da IA</h4>
            <p className="text-indigo-50 text-sm font-medium">{aiInsight}</p>
          </div>
          <button onClick={() => setAiInsight(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
        </div>
      )}

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar aluno..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                <th className="px-6 md:px-8 py-5">Aluno / Idade</th>
                <th className="px-6 md:px-8 py-5">Série / Escola</th>
                <th className="px-6 md:px-8 py-5">Disciplinas</th>
                <th className="px-6 md:px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 group">
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-base md:text-lg shadow-md shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{calculateAge(student.birthDate)} anos</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <p className="text-sm font-bold text-slate-700">{student.grade}</p>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{student.school}</p>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <div className="flex flex-wrap gap-1">
                      {student.subjects?.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleGetAiInsight(student)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="IA Insight">
                        <MessageSquareCode size={18} />
                      </button>
                      <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar">
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-2 md:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
            <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white sticky top-0 z-10">
              <div>
                <h3 className="font-black text-xl md:text-2xl tracking-tight">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Dados Cadastrais</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Série</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Escola</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.school}
                  onChange={e => setFormData({...formData, school: e.target.value})}
                />
              </div>
              <div className="pt-6 flex flex-col md:flex-row gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 md:order-1 flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="order-1 md:order-2 flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Aluno'}
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
