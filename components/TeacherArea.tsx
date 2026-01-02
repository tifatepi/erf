
import React, { useState, useMemo } from 'react';
import { ClassSession, Student } from '../types';
import { ClipboardList, BookOpen, User, CheckCircle, Clock, Save, Loader2, MessageSquare } from 'lucide-react';

interface TeacherAreaProps {
  classes: ClassSession[];
  students: Student[];
  onUpdateClass: (id: string, updates: Partial<ClassSession>) => Promise<void>;
}

const TeacherArea: React.FC<TeacherAreaProps> = ({ classes, students, onUpdateClass }) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentNotes, setContentNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todaysClasses = useMemo(() => 
    classes.filter(c => c.date === today).sort((a,b) => a.time.localeCompare(b.time)),
    [classes, today]
  );

  const selectedClass = useMemo(() => 
    todaysClasses.find(c => c.id === selectedClassId),
    [todaysClasses, selectedClassId]
  );

  const getStudent = (id: string) => students.find(s => s.id === id);

  const handleSelectClass = (c: ClassSession) => {
    setSelectedClassId(c.id);
    setContentNotes(c.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedClassId) return;
    setIsSaving(true);
    try {
      await onUpdateClass(selectedClassId, { notes: contentNotes, status: 'COMPLETED' });
      setSelectedClassId(null);
    } catch (err) {
      alert("Erro ao salvar observações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Diário de Conteúdos</h2>
          <p className="text-slate-500 font-medium">Lançamento de atividades e observações pedagógicas.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sessão Ativa: {today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Today's Classes */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Aulas do Dia</p>
          <div className="space-y-2">
            {todaysClasses.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectClass(c)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                  selectedClassId === c.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedClassId === c.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                   {c.status === 'COMPLETED' ? <CheckCircle size={18} className={selectedClassId === c.id ? 'text-white' : 'text-emerald-500'} /> : <Clock size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedClassId === c.id ? 'text-indigo-200' : 'text-slate-400'}`}>{c.time}</p>
                  <p className="text-sm font-black truncate">{getStudent(c.studentId)?.name}</p>
                  <p className={`text-[11px] font-bold truncate ${selectedClassId === c.id ? 'text-indigo-100' : 'text-slate-400'}`}>{c.subject}</p>
                </div>
              </button>
            ))}
            {todaysClasses.length === 0 && (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center text-slate-400">
                 <p className="text-xs font-bold uppercase">Nenhuma aula para hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Logging Area */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right duration-300">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                        {getStudent(selectedClass.studentId)?.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{getStudent(selectedClass.studentId)?.name}</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">{selectedClass.subject} • {selectedClass.time}</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                       <BookOpen size={14} className="text-indigo-500" />
                       Conteúdo Ministrado e Observações
                    </label>
                    <textarea 
                      className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-medium min-h-[250px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                      placeholder="Descreva o que foi trabalhado, dificuldades apresentadas e recomendações para a próxima sessão..."
                      value={contentNotes}
                      onChange={(e) => setContentNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3">
                     <button 
                       onClick={() => setSelectedClassId(null)}
                       className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                     >
                       Cancelar
                     </button>
                     <button 
                       onClick={handleSaveNotes}
                       disabled={isSaving}
                       className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                     >
                       {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                       {isSaving ? 'Salvando...' : 'Concluir Aula'}
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-300">
               <MessageSquare size={48} className="opacity-20 mb-4" />
               <p className="font-bold text-center">Selecione uma aula na lista à esquerda para lançar os conteúdos do dia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherArea;
