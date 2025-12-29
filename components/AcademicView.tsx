
import React, { useState } from 'react';
import { Student } from '../types';
import { BookOpen, Star, AlertCircle, TrendingUp, Save } from 'lucide-react';

interface AcademicViewProps {
  students: Student[];
}

const AcademicView: React.FC<AcademicViewProps> = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Desempenho Acadêmico</h2>
          <p className="text-slate-500">Acompanhamento de notas e evolução pedagógica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Alunos</p>
          <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                  selectedStudent?.id === s.id 
                    ? 'bg-indigo-600 text-white shadow-md font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedStudent ? (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🎓</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-slate-500 text-sm">{selectedStudent.grade} • {selectedStudent.school}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Média Geral</p>
                    <p className="text-2xl font-bold text-indigo-800">8.4</p>
                    <div className="flex items-center gap-1 text-[10px] text-indigo-500 mt-1">
                      <TrendingUp size={10} /> +0.5 vs último mês
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Presença</p>
                    <p className="text-2xl font-bold text-emerald-800">92%</p>
                    <p className="text-[10px] text-emerald-500 mt-1">Ótima frequência</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-600 uppercase mb-1">Alertas</p>
                    <p className="text-2xl font-bold text-amber-800">0</p>
                    <p className="text-[10px] text-amber-500 mt-1">Nenhum comportamento atípico</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  Observações do Professor
                </h4>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Descreva o progresso do aluno nesta semana..."
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-all active:scale-95">
                    <Save size={16} />
                    Salvar Registro
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Selecione um aluno para ver os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicView;
