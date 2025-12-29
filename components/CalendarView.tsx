
import React from 'react';
import { ClassSession, Student } from '../types';
import { Calendar as CalendarIcon, Clock, User, Book } from 'lucide-react';

interface CalendarViewProps {
  classes: ClassSession[];
  students: Student[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes, students }) => {
  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';
  
  // Group classes by day (simplification)
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Agenda de Aulas</h2>
          <p className="text-slate-500">Cronograma semanal de reforço.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all active:scale-95">
          <CalendarIcon size={18} />
          Agendar Aula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-w-[800px] md:min-w-0">
        {days.map((day, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm px-2 border-l-4 border-indigo-500">{day}</h3>
            <div className="space-y-2">
              {classes.length > 0 ? (
                classes.slice(0, 2 + (idx % 2)).map((c, i) => (
                  <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Clock size={14} />
                      <span className="text-[11px] font-bold">{c.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{c.subject}</h4>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                      <User size={10} />
                      <span className="truncate">{getStudentName(c.studentId)}</span>
                    </div>
                  </div>
                ))
              ) : null}
              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-all group flex items-center justify-center">
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Plus: React.FC<{className?: string, size?: number}> = ({className, size}) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default CalendarView;
