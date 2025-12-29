
import React, { useState } from 'react';
import { ClassSession, Student } from '../types';
import { Calendar as CalendarIcon, Clock, User, Book, X, Plus, Save } from 'lucide-react';

interface CalendarViewProps {
  classes: ClassSession[];
  students: Student[];
  onAddClass: (classData: Partial<ClassSession>) => Promise<void>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes, students, onAddClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    notes: ''
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';
  
  const weekDays = [
    { name: 'Segunda', dateOffset: 0 },
    { name: 'Terça', dateOffset: 1 },
    { name: 'Quarta', dateOffset: 2 },
    { name: 'Quinta', dateOffset: 3 },
    { name: 'Sexta', dateOffset: 4 },
  ];

  // Helper to filter classes for a specific display day (this is a simple simulation of a weekly view)
  // In a real app, we would use proper date logic with libraries like date-fns
  const getClassesForDay = (dayIndex: number) => {
    // For demo purposes, we show classes whose date matches the "simulated" week day
    // Or just distribute them if no specific date logic is applied to the mock
    return classes.filter(c => {
      const classDate = new Date(c.date);
      const day = classDate.getDay(); // 0 is Sunday, 1 is Monday...
      return day === (dayIndex + 1);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subject) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddClass({
        studentId: formData.studentId,
        subject: formData.subject,
        date: formData.date,
        time: formData.time,
        notes: formData.notes
      });
      setIsModalOpen(false);
      setFormData({
        studentId: '',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        notes: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (date?: string) => {
    if (date) {
       setFormData(prev => ({ ...prev, date }));
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agenda de Aulas</h2>
          <p className="text-slate-500 font-medium">Controle seu cronograma semanal com precisão.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <CalendarIcon size={18} />
          Agendar Aula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-w-full pb-4">
        {weekDays.map((day, idx) => {
          const dayClasses = getClassesForDay(idx);
          
          return (
            <div key={idx} className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center justify-between px-2 mb-1">
                <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest border-l-4 border-indigo-500 pl-2">
                  {day.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
                  {dayClasses.length}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 bg-slate-50/50 p-3 rounded-[2rem] border border-slate-100 min-h-[400px]">
                {dayClasses.length > 0 ? (
                  dayClasses.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-indigo-600">
                          <Clock size={12} className="shrink-0" />
                          <span className="text-[11px] font-black">{c.time}</span>
                        </div>
                        {c.status === 'COMPLETED' && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{c.subject}</h4>
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                          <User size={10} className="text-slate-500" />
                        </div>
                        <span className="text-[10px] font-bold truncate">{getStudentName(c.studentId)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                    <Book size={24} className="opacity-20 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sem aulas</p>
                  </div>
                )}
                
                <button 
                  onClick={() => openModal()}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:text-indigo-500 hover:border-indigo-200 hover:bg-white transition-all group flex items-center justify-center gap-2"
                >
                  <Plus size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Novo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Agendar Aula</h3>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Sincronização com o painel do aluno</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno</label>
                <select 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina / Assunto</label>
                <input 
                  type="text" required
                  placeholder="Ex: Reforço de Matemática - Frações"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                  <input 
                    type="time" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações (Opcional)</label>
                <textarea 
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px]"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Temas específicos, materiais necessários..."
                ></textarea>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Agendar Aula
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
