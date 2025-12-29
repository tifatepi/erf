
import React, { useState, useMemo } from 'react';
import { ClassSession, Student } from '../types';
import { Calendar as CalendarIcon, Clock, User, Book, X, Plus, Save, Search, Check, Trash2, Loader2 } from 'lucide-react';

interface CalendarViewProps {
  classes: ClassSession[];
  students: Student[];
  onAddClass: (classData: Partial<ClassSession>) => Promise<void>;
  onUpdateClass?: (id: string, classData: Partial<ClassSession>) => Promise<void>;
  onDeleteClass?: (id: string) => Promise<void>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes, students, onAddClass, onUpdateClass, onDeleteClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  
  // Busca interna para o seletor de alunos
  const [studentSearch, setStudentSearch] = useState('');
  
  const [formData, setFormData] = useState({
    studentIds: [] as string[],
    subject: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    notes: '',
    status: 'SCHEDULED' as any
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';
  
  const weekDays = [
    { name: 'Dom', dayIndex: 0 },
    { name: 'Seg', dayIndex: 1 },
    { name: 'Ter', dayIndex: 2 },
    { name: 'Qua', dayIndex: 3 },
    { name: 'Qui', dayIndex: 4 },
    { name: 'Sex', dayIndex: 5 },
    { name: 'Sáb', dayIndex: 6 },
  ];

  const getClassesForDay = (dayIndex: number) => {
    return (classes || []).filter(c => {
      const dateParts = c.date.split('-');
      const classDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      return classDate.getDay() === dayIndex;
    });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.grade.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const toggleStudentSelection = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.studentIds.includes(id);
      if (isSelected) {
        return { ...prev, studentIds: prev.studentIds.filter(sid => sid !== id) };
      } else {
        return { ...prev, studentIds: [...prev.studentIds, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentIds.length === 0 || !formData.subject) {
      alert("Por favor, selecione ao menos um aluno e preencha a disciplina.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClass && onUpdateClass) {
        await onUpdateClass(editingClass.id, {
          studentId: formData.studentIds[0],
          subject: formData.subject,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          status: formData.status
        });
      } else {
        const promises = formData.studentIds.map(sid => 
          onAddClass({
            studentId: sid,
            subject: formData.subject,
            date: formData.date,
            time: formData.time,
            notes: formData.notes,
            status: 'SCHEDULED'
          })
        );
        await Promise.all(promises);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingClass || !onDeleteClass) {
      console.warn("Nenhuma aula selecionada ou função onDeleteClass ausente.");
      return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir permanentemente este agendamento?")) {
      setIsDeleting(true);
      try {
        console.log("CalendarView: Chamando onDeleteClass para ID", editingClass.id);
        await onDeleteClass(editingClass.id);
        closeModal();
      } catch (error) {
        console.error("CalendarView: Erro ao excluir aula", error);
        alert("Não foi possível excluir a aula. Verifique sua conexão.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openModal = (date?: string) => {
    setEditingClass(null);
    setFormData({
      studentIds: [],
      subject: '',
      date: date || new Date().toISOString().split('T')[0],
      time: '14:00',
      notes: '',
      status: 'SCHEDULED'
    });
    setStudentSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassSession) => {
    setEditingClass(c);
    setFormData({
      studentIds: [c.studentId],
      subject: c.subject,
      date: c.date,
      time: c.time,
      notes: c.notes || '',
      status: c.status
    });
    setStudentSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setIsDeleting(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agenda Semanal</h2>
          <p className="text-slate-500 font-medium">Cronograma de aulas de segunda a domingo.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95"
        >
          <CalendarIcon size={18} />
          Agendar Aula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayClasses = getClassesForDay(day.dayIndex);
          const isWeekend = day.dayIndex === 0 || day.dayIndex === 6;
          
          return (
            <div key={day.dayIndex} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2 mb-1">
                <h3 className={`font-black text-[10px] uppercase tracking-widest border-l-4 pl-2 ${isWeekend ? 'border-amber-400 text-amber-600' : 'border-indigo-500 text-slate-700'}`}>
                  {day.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dayClasses.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  {dayClasses.length}
                </span>
              </div>
              
              <div className={`flex-1 space-y-2 p-2 rounded-[1.5rem] border min-h-[400px] transition-colors ${isWeekend ? 'bg-amber-50/30 border-amber-100/50' : 'bg-slate-50/50 border-slate-100'}`}>
                {dayClasses.length > 0 ? (
                  dayClasses.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => openEditModal(c)}
                      className={`p-3 rounded-xl border shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden bg-white ${c.status === 'COMPLETED' ? 'border-emerald-100 opacity-80' : 'border-slate-100 hover:border-indigo-300'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`flex items-center gap-1 ${c.status === 'COMPLETED' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                          <Clock size={10} className="shrink-0" />
                          <span className="text-[10px] font-black">{c.time}</span>
                        </div>
                        {c.status === 'COMPLETED' && (
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        )}
                      </div>
                      <h4 className={`text-[11px] font-black mb-1 leading-tight transition-colors line-clamp-2 ${c.status === 'COMPLETED' ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                        {c.subject}
                      </h4>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User size={10} className="shrink-0" />
                        <span className="text-[9px] font-bold truncate">{getStudentName(c.studentId)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-300">
                    <Book size={16} className="opacity-20 mb-1" />
                    <p className="text-[8px] font-bold uppercase tracking-widest">Vazio</p>
                  </div>
                )}
                
                <button 
                  onClick={() => openModal()}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-indigo-500 hover:border-indigo-200 hover:bg-white transition-all group flex items-center justify-center"
                >
                  <Plus size={14} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className={`p-8 border-b flex items-center justify-between text-white ${editingClass ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <div>
                <h3 className="font-black text-2xl tracking-tight">{editingClass ? 'Editar Aula' : 'Agendar Aula'}</h3>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                  {editingClass ? 'Atualize as informações da sessão' : 'Você pode selecionar vários alunos para aulas em grupo'}
                </p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Alunos ({formData.studentIds.length})
                  </label>
                  {!editingClass && (
                    <div className="relative w-48">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar aluno..."
                        className="w-full pl-8 pr-3 py-1 bg-slate-50 border-none rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="max-h-40 overflow-y-auto bg-slate-50 rounded-2xl p-3 border border-slate-100 grid grid-cols-2 gap-2">
                  {editingClass ? (
                    <div className="col-span-2 flex items-center gap-3 p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <Check size={14} className="text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-700">{getStudentName(formData.studentIds[0])}</span>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          formData.studentIds.includes(student.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${formData.studentIds.includes(student.id) ? 'bg-white/20 border-white' : 'bg-slate-50 border-slate-200'}`}>
                          {formData.studentIds.includes(student.id) && <Check size={10} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold truncate ${formData.studentIds.includes(student.id) ? 'text-white' : 'text-slate-800'}`}>{student.name}</p>
                          <p className={`text-[9px] font-medium ${formData.studentIds.includes(student.id) ? 'text-indigo-100' : 'text-slate-400'}`}>{student.grade}</p>
                        </div>
                      </button>
                    ))
                  )}
                  {filteredStudents.length === 0 && !editingClass && (
                    <p className="col-span-2 text-center py-4 text-xs font-medium text-slate-400 italic">Nenhum aluno encontrado.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina / Assunto</label>
                <input 
                  type="text" required
                  placeholder="Ex: Reforço de Matemática"
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

              {editingClass && (
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="SCHEDULED">Agendada</option>
                    <option value="COMPLETED">Realizada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                <textarea 
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[60px]"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Detalhes da aula..."
                ></textarea>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {editingClass && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                    className="order-3 sm:order-1 flex-1 px-6 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-black hover:bg-rose-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    Excluir
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={isSubmitting || isDeleting}
                  className="order-2 flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || isDeleting || formData.studentIds.length === 0}
                  className={`order-1 flex-1 px-6 py-4 text-white rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${editingClass ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      {editingClass ? 'Atualizar Aula' : `Agendar ${formData.studentIds.length > 1 ? `${formData.studentIds.length} Aulas` : 'Aula'}`}
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
