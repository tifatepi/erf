
import React, { useState, useMemo } from 'react';
import { ClassSession, Student } from '../types';
import { Calendar as CalendarIcon, Clock, User, Book, X, Plus, Save, Search, Check, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [studentSearch, setStudentSearch] = useState('');
  
  // Controle de colapso para mobile
  const [expandedDay, setExpandedDay] = useState<number | null>(new Date().getDay());
  
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
    { name: 'Dom', fullName: 'Domingo', dayIndex: 0 },
    { name: 'Seg', fullName: 'Segunda-feira', dayIndex: 1 },
    { name: 'Ter', fullName: 'Terça-feira', dayIndex: 2 },
    { name: 'Qua', fullName: 'Quarta-feira', dayIndex: 3 },
    { name: 'Qui', fullName: 'Quinta-feira', dayIndex: 4 },
    { name: 'Sex', fullName: 'Sexta-feira', dayIndex: 5 },
    { name: 'Sáb', fullName: 'Sábado', dayIndex: 6 },
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
    if (!editingClass || !onDeleteClass) return;
    if (window.confirm("Deseja excluir este agendamento?")) {
      setIsDeleting(true);
      try {
        await onDeleteClass(editingClass.id);
        closeModal();
      } catch (error) {
        alert("Erro ao excluir aula.");
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
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center sm:text-left">Agenda Semanal</h2>
          <p className="text-slate-500 font-medium text-center sm:text-left text-sm">Cronograma escolar organizado.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 justify-center transition-all active:scale-95 w-full sm:w-auto"
        >
          <CalendarIcon size={18} />
          Agendar Aula
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayClasses = getClassesForDay(day.dayIndex);
          const isWeekend = day.dayIndex === 0 || day.dayIndex === 6;
          const isExpanded = expandedDay === day.dayIndex;
          
          return (
            <div key={day.dayIndex} className="flex flex-col gap-2">
              <button 
                onClick={() => setExpandedDay(isExpanded ? null : day.dayIndex)}
                className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl lg:bg-transparent lg:border-none lg:p-0 lg:cursor-default group"
              >
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-[10px] md:text-[11px] uppercase tracking-widest border-l-4 pl-2 ${isWeekend ? 'border-amber-400 text-amber-600' : 'border-indigo-500 text-slate-700'}`}>
                    <span className="lg:hidden">{day.fullName}</span>
                    <span className="hidden lg:inline">{day.name}</span>
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dayClasses.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {dayClasses.length}
                  </span>
                </div>
                <div className="lg:hidden text-slate-400">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              
              <div className={`
                ${isExpanded ? 'flex' : 'hidden'} lg:flex flex-col space-y-2 p-2 rounded-[1.5rem] border transition-all duration-300
                ${isWeekend ? 'bg-amber-50/20 border-amber-100/40' : 'bg-slate-50/50 border-slate-100'}
                min-h-[100px] lg:min-h-[400px]
              `}>
                {dayClasses.length > 0 ? (
                  dayClasses.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => openEditModal(c)}
                      className={`p-3 rounded-xl border shadow-sm hover:shadow-md transition-all group cursor-pointer bg-white ${c.status === 'COMPLETED' ? 'border-emerald-100 opacity-80' : 'border-slate-100 hover:border-indigo-200'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Clock size={10} />
                          <span className="text-[10px] font-black">{c.time}</span>
                        </div>
                        {c.status === 'COMPLETED' && <Check size={10} className="text-emerald-500" />}
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">{c.subject}</h4>
                      <p className="text-[9px] font-medium text-slate-400 truncate">{getStudentName(c.studentId)}</p>
                    </div>
                  ))
                ) : (
                  <div className="hidden lg:flex flex-col items-center justify-center h-24 text-slate-200">
                    <Book size={16} className="opacity-20 mb-1" />
                    <p className="text-[8px] font-bold uppercase tracking-widest">Vazio</p>
                  </div>
                )}
                
                <button 
                  onClick={() => openModal()}
                  className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-indigo-500 hover:border-indigo-200 hover:bg-white transition-all flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-2 md:p-4 animate-fade-in">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
            <div className={`p-6 md:p-8 border-b flex items-center justify-between text-white ${editingClass ? 'bg-amber-500' : 'bg-indigo-600'} sticky top-0 z-10`}>
              <h3 className="font-black text-xl md:text-2xl tracking-tight">{editingClass ? 'Editar Aula' : 'Agendar Aula'}</h3>
              <button onClick={closeModal} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alunos Selecionados</label>
                <div className="max-h-32 overflow-y-auto bg-slate-50 rounded-2xl p-2 border border-slate-100 grid grid-cols-1 gap-1">
                  {students.map(student => (
                    <button
                      key={student.id} type="button"
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        formData.studentIds.includes(student.id)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] font-bold truncate">{student.name}</span>
                      {formData.studentIds.includes(student.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                  <input type="date" required className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                  <input type="time" required className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex flex-col md:flex-row gap-3">
                {editingClass && (
                  <button type="button" onClick={handleDelete} className="order-3 md:order-1 flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-black flex items-center justify-center gap-2"><Trash2 size={18} /> Excluir</button>
                )}
                <button type="button" onClick={closeModal} className="order-2 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className={`order-1 flex-1 py-4 text-white rounded-2xl text-sm font-black shadow-lg ${editingClass ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                  {isSubmitting ? 'Salvando...' : 'Confirmar'}
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
