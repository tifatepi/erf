
import React, { useState } from 'react';
import { Student } from '../types';
import { BookOpen, Star, AlertCircle, TrendingUp, Save, User } from 'lucide-react';

interface AcademicViewProps {
  students: Student[];
}

const AcademicView: React.FC<AcademicViewProps> = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Desempenho Acadêmico</h2>
          <p className="text-slate-500 font-medium text-sm">Acompanhamento e evolução pedagógica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Sidebar / Selector */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Alunos Matriculados</p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide bg-white lg:bg-transparent p-2 rounded-2xl lg:p-0 border lg:border-none border-slate-200">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`flex-1 lg:w-full text-left px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                  selectedStudent?.id === s.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold scale-[1.02]' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm bg-white/50 border border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={14} className={selectedStudent?.id === s.id ? 'text-indigo-200' : 'text-slate-400'} />
                  {s.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {selectedStudent ? (
            <>
              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-8 text-center md:text-left">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h3>
                    <p className="text-slate-500 text-sm font-medium">{selectedStudent.grade} • {selectedStudent.school}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                      {selectedStudent.subjects?.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 group hover:bg-indigo-50 transition-colors">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Média Geral</p>
                    <p className="text-3xl font-black text-indigo-600">8.4</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 mt-2">
                      <TrendingUp size={12} /> +0.5 vs último mês
                    </div>
                  </div>
                  <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Presença</p>
                    <p className="text-3xl font-black text-emerald-600">92%</p>
                    <p className="text-[10px] font-bold text-emerald-500 mt-2">Ótima frequência</p>
                  </div>
                  <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100/50 group hover:bg-amber-50 transition-colors">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Alertas</p>
                    <p className="text-3xl font-black text-amber-600">0</p>
                    <p className="text-[10px] font-bold text-amber-500 mt-2">Nenhum evento</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  Evolução Pedagógica
                </h4>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Relatório da Sessão</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-medium min-h-[150px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Quais foram as principais dificuldades e conquistas do aluno hoje?"
                  ></textarea>
                  <div className="flex justify-end pt-2">
                    <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Save size={18} />
                      Salvar Registro
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-400">
              <BookOpen size={48} className="opacity-20 mb-4" />
              <p className="font-bold text-center">Selecione um aluno na lista ao lado para ver o desempenho acadêmico detalhado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicView;
