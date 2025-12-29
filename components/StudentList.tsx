
import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Filter, MessageSquareCode, X } from 'lucide-react';
import { getAcademicInsights } from '../services/geminiService';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Partial<Student>) => Promise<void>;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    age: 0,
    grade: '',
    school: '',
    subjects: [] as string[]
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGetAiInsight = async (student: Student) => {
    setLoadingAi(true);
    const dataString = `Aluno: ${student.name}, Idade: ${student.age}, Matérias: ${student.subjects?.join(', ') || 'Nenhuma'}`;
    const result = await getAcademicInsights(dataString);
    setAiInsight(result);
    setLoadingAi(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && newStudent.grade) {
      setIsSubmitting(true);
      try {
        await onAddStudent({
          ...newStudent,
          subjects: newStudent.subjects.length > 0 ? newStudent.subjects : ['Matemática']
        });
        setIsModalOpen(false);
        setNewStudent({ name: '', age: 0, grade: '', school: '', subjects: [] });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Alunos</h2>
          <p className="text-slate-500 font-medium">Administre o corpo discente com dados em tempo real.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <Plus size={18} />
          Novo Aluno
        </button>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 text-white p-6 rounded-3xl flex items-start gap-4 shadow-2xl relative animate-fade-in">
          <div className="bg-white/20 p-3 rounded-2xl">
            <MessageSquareCode size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-lg mb-1">Insight Pedagógico (IA)</h4>
            <p className="text-indigo-50 text-sm leading-relaxed font-medium">{aiInsight}</p>
          </div>
          <button onClick={() => setAiInsight(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome do aluno..." 
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all">
            <Filter size={18} />
            Filtros Avançados
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.1em]">
                <th className="px-8 py-5">Aluno</th>
                <th className="px-8 py-5">Série / Instituição</th>
                <th className="px-8 py-5">Foco Pedagógico</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-200">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">ID: {student.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{student.grade}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{student.school}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {student.subjects?.map((sub, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleGetAiInsight(student)}
                        disabled={loadingAi}
                        className="p-3 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                        title="Analisar com IA"
                      >
                        <MessageSquareCode size={20} className={loadingAi ? 'animate-pulse' : ''} />
                      </button>
                      <button className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Novo Aluno</h3>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Cadastro no Sistema Cloud</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required
                  placeholder="Nome do aluno"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newStudent.age || ''}
                    onChange={e => setNewStudent({...newStudent, age: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Série</label>
                  <input 
                    type="text" required
                    placeholder="Ex: 8º Ano"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newStudent.grade}
                    onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Escola de Origem</label>
                <input 
                  type="text"
                  placeholder="Nome da escola"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newStudent.school}
                  onChange={e => setNewStudent({...newStudent, school: e.target.value})}
                />
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
