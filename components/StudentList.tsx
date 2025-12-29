
import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Filter, MessageSquareCode, X } from 'lucide-react';
import { getAcademicInsights } from '../services/geminiService';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Student Form State
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
    const dataString = `Aluno: ${student.name}, Idade: ${student.age}, Matérias: ${student.subjects.join(', ')}`;
    const result = await getAcademicInsights(dataString);
    setAiInsight(result);
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && newStudent.grade) {
      onAddStudent({
        ...newStudent,
        id: '',
        guardianId: 'r_new',
        subjects: newStudent.subjects.length > 0 ? newStudent.subjects : ['Matemática']
      } as Student);
      setIsModalOpen(false);
      setNewStudent({ name: '', age: 0, grade: '', school: '', subjects: [] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Alunos</h2>
          <p className="text-slate-500">Administre o corpo discente da instituição.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <Plus size={18} />
          Novo Aluno
        </button>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-start gap-3 shadow-lg relative animate-in zoom-in-95 duration-300">
          <MessageSquareCode className="shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold mb-1">Insight Pedagógico (IA)</h4>
            <p className="text-indigo-50 text-sm leading-relaxed">{aiInsight}</p>
          </div>
          <button onClick={() => setAiInsight(null)} className="absolute top-2 right-2 p-1 hover:bg-indigo-500 rounded-lg">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome do aluno..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Série / Instituição</th>
                <th className="px-6 py-4">Foco Pedagógico</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-500">ID: {student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.grade}</p>
                    <p className="text-xs text-slate-400">{student.school}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleGetAiInsight(student)}
                        disabled={loadingAi}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Analisar com IA"
                      >
                        <MessageSquareCode size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhum aluno encontrado com este nome.
            </div>
          )}
        </div>
      </div>

      {/* Modal Adicionar Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="font-bold text-lg">Cadastrar Novo Aluno</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Idade</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newStudent.age || ''}
                    onChange={e => setNewStudent({...newStudent, age: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Série</label>
                  <input 
                    type="text" required
                    placeholder="Ex: 8º Ano"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newStudent.grade}
                    onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Escola</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newStudent.school}
                  onChange={e => setNewStudent({...newStudent, school: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                >
                  Salvar Aluno
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
