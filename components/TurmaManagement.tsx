
import React, { useState, useEffect } from 'react';
import { Turma, Student, Teacher, AttendanceRecord } from '../types';
import { db } from '../services/supabaseService';
// Fix: Add missing 'Shapes' import from lucide-react
import { 
  Plus, 
  Users, 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Search, 
  MoreVertical, 
  Trash2,
  GraduationCap,
  Loader2,
  ChevronRight,
  Shapes
} from 'lucide-react';

interface TurmaManagementProps {
  students: Student[];
  teachers: Teacher[];
}

const TurmaManagement: React.FC<TurmaManagementProps> = ({ students, teachers }) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [presents, setPresents] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    teacherId: '',
    studentIds: [] as string[]
  });

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    setLoading(true);
    try {
      const data = await db.turmas.list();
      setTurmas(data);
    } catch (err) {
      console.error("Erro ao carregar turmas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const created = await db.turmas.create(formData);
      setTurmas(prev => [...prev, created]);
      setIsModalOpen(false);
      setFormData({ name: '', subject: '', teacherId: '', studentIds: [] });
    } catch (err) {
      alert("Erro ao criar turma.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTurma = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta turma?")) {
      try {
        await db.turmas.delete(id);
        setTurmas(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  };

  const openAttendance = async (turma: Turma) => {
    setSelectedTurma(turma);
    setIsAttendanceModalOpen(true);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    try {
      const record = await db.attendance.getByTurmaAndDate(turma.id, new Date().toISOString().split('T')[0]);
      setPresents(record?.presentStudentIds || []);
    } catch (err) {
      console.error("Erro ao carregar frequência:", err);
    }
  };

  const togglePresence = (studentId: string) => {
    setPresents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const saveAttendance = async () => {
    if (!selectedTurma) return;
    setIsSaving(true);
    try {
      await db.attendance.save({
        turmaId: selectedTurma.id,
        date: attendanceDate,
        presentStudentIds: presents
      });
      setIsAttendanceModalOpen(false);
    } catch (err) {
      alert("Erro ao salvar frequência.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStudentSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) 
        ? prev.studentIds.filter(sid => sid !== id) 
        : [...prev.studentIds, id]
    }));
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Sem Docente';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Turmas</h2>
          <p className="text-slate-500 font-medium">Organize alunos e registre frequências.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          Nova Turma
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6 border-b border-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                    <Shapes size={20} />
                  </div>
                  <button onClick={() => handleDeleteTurma(turma.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-black text-slate-900 line-clamp-1">{turma.name}</h3>
                <p className="text-sm font-bold text-indigo-500 mt-1 uppercase tracking-widest text-[10px]">{turma.subject}</p>
                
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex -space-x-3 overflow-hidden">
                      {turma.studentIds.slice(0, 4).map((sid, i) => (
                        <div key={sid} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {students.find(s => s.id === sid)?.name.charAt(0)}
                        </div>
                      ))}
                      {turma.studentIds.length > 4 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-white text-[9px] font-black">
                          +{turma.studentIds.length - 4}
                        </div>
                      )}
                   </div>
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{turma.studentIds.length} Alunos</span>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => openAttendance(turma)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all"
                >
                  <ClipboardCheck size={16} />
                  Frequência
                </button>
              </div>
            </div>
          ))}

          {turmas.length === 0 && (
            <div className="col-span-full py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
               <Shapes size={48} className="opacity-20 mb-4" />
               <p className="font-bold">Nenhuma turma cadastrada. Crie a primeira acima!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Turma */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white sticky top-0 z-10">
              <h3 className="font-black text-2xl tracking-tight">Nova Turma</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateTurma} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Turma</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Professor Responsável</label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.teacherId}
                  onChange={e => setFormData({...formData, teacherId: e.target.value})}
                  required
                >
                  <option value="">Selecione um professor...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecionar Alunos ({formData.studentIds.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  {students.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        formData.studentIds.includes(student.id)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold truncate">{student.name}</span>
                      {formData.studentIds.includes(student.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50">
                   {isSaving ? 'Salvando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Frequência */}
      {isAttendanceModalOpen && selectedTurma && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-600 text-white rounded-t-[2.5rem]">
              <div>
                <h3 className="font-black text-xl tracking-tight">Diário de Presença</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">{selectedTurma.name}</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-2.5 rounded-xl shadow-sm"><CalendarIcon size={20} className="text-indigo-600" /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data da Aula</p>
                  <input 
                    type="date" 
                    className="bg-transparent border-none text-sm font-bold focus:ring-0 p-0 w-full"
                    value={attendanceDate}
                    onChange={async (e) => {
                      setAttendanceDate(e.target.value);
                      const record = await db.attendance.getByTurmaAndDate(selectedTurma.id, e.target.value);
                      setPresents(record?.presentStudentIds || []);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lista de Chamada</p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedTurma.studentIds.map(sid => {
                    const student = students.find(s => s.id === sid);
                    if (!student) return null;
                    const isPresent = presents.includes(sid);
                    return (
                      <button
                        key={sid}
                        onClick={() => togglePresence(sid)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isPresent 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isPresent ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold">{student.name}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isPresent ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-50 text-slate-200'}`}>
                          <Check size={14} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsAttendanceModalOpen(false)} 
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black"
                >
                  Fechar
                </button>
                <button 
                  onClick={saveAttendance}
                  disabled={isSaving}
                  className="flex-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  {isSaving ? 'Salvando...' : 'Salvar Frequência'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurmaManagement;
