
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import InstitutionList from './components/InstitutionList';
import TeacherList from './components/TeacherList';
import FinancialList from './components/FinancialList';
import AcademicView from './components/AcademicView';
import CalendarView from './components/CalendarView';
import UserManagement from './components/UserManagement';
import TurmaManagement from './components/TurmaManagement';
import ReportView from './components/ReportView';
import TeacherArea from './components/TeacherArea';
import DelinquencyView from './components/DelinquencyView';
import Login from './components/Login';
import { UserRole, Student, Payment, ClassSession, User, Institution, Teacher, Turma } from './types';
import { db } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadAllData();
    }
  }, [isAuthenticated, currentUser]);

  const loadAllData = async () => {
    setIsDataSyncing(true);
    try {
      const [sData, iData, tData, pData, cData, tuData] = await Promise.all([
        db.students.list().catch(() => []),
        db.institutions.list().catch(() => []),
        db.teachers.list().catch(() => []),
        db.payments.list().catch(() => []),
        db.classes.list().catch(() => []),
        db.turmas.list().catch(() => [])
      ]);
      setStudents(sData || []);
      setInstitutions(iData || []);
      setTeachers(tData || []);
      setPayments(pData || []);
      setClasses(cData || []);
      setTurmas(tuData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsDataSyncing(false);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = (payments || [])
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCount = (payments || []).filter(p => p.status === 'OVERDUE').length;
    
    return {
      totalStudents: (students || []).length,
      classesDone: (classes || []).filter(c => c.status === 'COMPLETED').length,
      revenue: totalRevenue,
      pending: pendingCount
    };
  }, [students, payments, classes]);

  const handleLogin = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const user = await db.auth.login(email, password || '');
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        alert("E-mail ou senha incorretos.");
      }
    } catch (err) {
      alert("Erro ao conectar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const addInstitution = async (data: Partial<Institution>) => {
    try {
      const created = await db.institutions.create(data);
      setInstitutions(prev => [...prev, created]);
    } catch (err) { alert("Erro ao criar instituição."); }
  };

  const updateInstitution = async (id: string, data: Partial<Institution>) => {
    try {
      const updated = await db.institutions.update(id, data);
      setInstitutions(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) { alert("Erro ao atualizar instituição."); }
  };

  const deleteInstitution = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta instituição?")) {
      try {
        await db.institutions.delete(id);
        setInstitutions(prev => prev.filter(i => i.id !== id));
      } catch (err) { alert("Erro ao excluir instituição."); }
    }
  };

  const addTeacher = async (data: Partial<Teacher>) => {
    try {
      const created = await db.teachers.create(data);
      setTeachers(prev => [...prev, created]);
    } catch (err) { alert("Erro ao criar docente."); }
  };

  const updateTeacher = async (id: string, data: Partial<Teacher>) => {
    try {
      const updated = await db.teachers.update(id, data);
      setTeachers(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) { alert("Erro ao atualizar docente."); }
  };

  const deleteTeacher = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este docente?")) {
      try {
        await db.teachers.delete(id);
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (err) { alert("Erro ao excluir docente."); }
    }
  };

  const addStudent = async (newStudent: Partial<Student>) => {
    try {
      const created = await db.students.create(newStudent);
      setStudents(prev => [...prev, created]);
    } catch (err: any) { alert(`Erro ao salvar aluno: ${err.message}`); }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await db.students.update(id, updates);
      setStudents(prev => (prev || []).map(s => String(s.id) === String(id) ? updated : s));
    } catch (err: any) { alert(`Erro ao atualizar aluno: ${err.message}`); }
  };

  const addPayment = async (newPayment: Partial<Payment>) => {
    try {
      const created = await db.payments.create(newPayment);
      setPayments(prev => [created, ...prev]);
    } catch (err: any) { alert(`Erro no financeiro: ${err.message}`); }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const updated = await db.payments.update(id, updates);
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err: any) { alert(`Erro ao atualizar pagamento: ${err.message}`); }
  };

  const addClassSession = async (newClass: Partial<ClassSession>) => {
    try {
      const created = await db.classes.create({
        ...newClass,
        teacherId: currentUser?.id || 'system',
        status: 'SCHEDULED'
      });
      setClasses(prev => [...prev, created]);
    } catch (err) { alert("Erro ao agendar aula"); }
  };

  const updateClassSession = async (id: string, updates: Partial<ClassSession>) => {
    try {
      const updated = await db.classes.update(id, updates);
      setClasses(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) { alert("Erro ao atualizar aula"); }
  };

  const deleteClassSession = async (id: string) => {
    try {
      await db.classes.delete(id);
      setClasses(prev => prev.filter(c => String(c.id) !== String(id)));
    } catch (err) { console.error("Erro ao deletar aula:", err); }
  };

  const renderContent = () => {
    if (isDataSyncing) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Sincronizando dados...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} classes={classes} students={students} />;
      case 'teacher-area':
        return <TeacherArea classes={classes} students={students} onUpdateClass={updateClassSession} />;
      case 'institutions':
        return <InstitutionList institutions={institutions} onAdd={addInstitution} onUpdate={updateInstitution} onDelete={deleteInstitution} />;
      case 'teachers':
        return <TeacherList teachers={teachers} onAdd={addTeacher} onUpdate={updateTeacher} onDelete={deleteTeacher} />;
      case 'students':
        return <StudentList students={students} institutions={institutions} onAddStudent={addStudent} onUpdateStudent={updateStudent} />;
      case 'turmas':
        return <TurmaManagement students={students} teachers={teachers} />;
      case 'financial':
        return <FinancialList payments={payments} students={students} onAddPayment={addPayment} onUpdatePayment={updatePayment} />;
      case 'delinquency':
        return <DelinquencyView payments={payments} students={students} />;
      case 'reports':
        return <ReportView payments={payments} students={students} turmas={turmas} />;
      case 'calendar':
        return <CalendarView classes={classes} students={students} onAddClass={addClassSession} onUpdateClass={updateClassSession} onDeleteClass={deleteClassSession} />;
      case 'academic':
        return <AcademicView students={students} />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard stats={stats} classes={classes} students={students} />;
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} isLoading={isLoading} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser!} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
