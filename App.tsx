
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
import Login from './components/Login';
import { UserRole, Student, Payment, ClassSession, User, Institution, Teacher } from './types';
import { db } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadAllData();
    }
  }, [isAuthenticated, currentUser]);

  const loadAllData = async () => {
    setIsDataSyncing(true);
    try {
      const [sData, iData, tData, pData, cData] = await Promise.all([
        db.students.list().catch(() => []),
        db.institutions.list().catch(() => []),
        db.teachers.list().catch(() => []),
        db.payments.list().catch(() => []),
        db.classes.list().catch(() => [])
      ]);
      setStudents(sData || []);
      setInstitutions(iData || []);
      setTeachers(tData || []);
      setPayments(pData || []);
      setClasses(cData || []);
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
    const pendingCount = (payments || []).filter(p => p.status !== 'PAID').length;
    
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

  // CRUD Instituições
  const addInstitution = async (data: Partial<Institution>) => {
    try {
      const created = await db.institutions.create(data);
      setInstitutions(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao criar instituição.");
    }
  };

  const updateInstitution = async (id: string, data: Partial<Institution>) => {
    try {
      const updated = await db.institutions.update(id, data);
      setInstitutions(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) {
      alert("Erro ao atualizar instituição.");
    }
  };

  const deleteInstitution = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta instituição?")) {
      try {
        await db.institutions.delete(id);
        setInstitutions(prev => prev.filter(i => i.id !== id));
      } catch (err) {
        alert("Erro ao excluir instituição.");
      }
    }
  };

  // CRUD Docentes
  const addTeacher = async (data: Partial<Teacher>) => {
    try {
      const created = await db.teachers.create(data);
      setTeachers(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao criar docente.");
    }
  };

  const updateTeacher = async (id: string, data: Partial<Teacher>) => {
    try {
      const updated = await db.teachers.update(id, data);
      setTeachers(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      alert("Erro ao atualizar docente.");
    }
  };

  const deleteTeacher = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este docente?")) {
      try {
        await db.teachers.delete(id);
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert("Erro ao excluir docente.");
      }
    }
  };

  // CRUD Alunos
  const addStudent = async (newStudent: Partial<Student>) => {
    try {
      const created = await db.students.create(newStudent);
      setStudents(prev => [...prev, created]);
    } catch (err: any) {
      console.error("App: Erro ao cadastrar aluno:", err);
      alert(`Erro ao salvar aluno: ${err.message || 'Verifique sua conexão'}`);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await db.students.update(id, updates);
      setStudents(prev => (prev || []).map(s => String(s.id) === String(id) ? updated : s));
    } catch (err: any) {
      console.error("App: Erro ao atualizar aluno:", err);
      alert(`Erro ao atualizar aluno: ${err.message || 'Verifique os dados'}`);
    }
  };

  const addPayment = async (newPayment: Partial<Payment>) => {
    try {
      const created = await db.payments.create(newPayment);
      setPayments(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao processar pagamento");
    }
  };

  const addClassSession = async (newClass: Partial<ClassSession>) => {
    try {
      const created = await db.classes.create({
        ...newClass,
        teacherId: currentUser?.id || 'system',
        status: 'SCHEDULED'
      });
      setClasses(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao agendar aula");
    }
  };

  const updateClassSession = async (id: string, updates: Partial<ClassSession>) => {
    try {
      const updated = await db.classes.update(id, updates);
      setClasses(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      alert("Erro ao atualizar aula");
    }
  };

  const deleteClassSession = async (id: string) => {
    try {
      await db.classes.delete(id);
      setClasses(prev => prev.filter(c => String(c.id) !== String(id)));
    } catch (err) {
      console.error("App: Erro ao deletar aula:", err);
      throw err;
    }
  };

  const renderContent = () => {
    if (isDataSyncing) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Sincronizando...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} classes={classes} students={students} />;
      case 'institutions':
        return <InstitutionList institutions={institutions} onAdd={addInstitution} onUpdate={updateInstitution} onDelete={deleteInstitution} />;
      case 'teachers':
        return <TeacherList teachers={teachers} onAdd={addTeacher} onUpdate={updateTeacher} onDelete={deleteTeacher} />;
      case 'students':
        return <StudentList students={students} onAddStudent={addStudent} onUpdateStudent={updateStudent} />;
      case 'financial':
        return <FinancialList payments={payments} students={students} onAddPayment={addPayment} />;
      case 'calendar':
        return (
          <CalendarView 
            classes={classes} 
            students={students} 
            onAddClass={addClassSession} 
            onUpdateClass={updateClassSession} 
            onDeleteClass={deleteClassSession}
          />
        );
      case 'academic':
        return <AcademicView students={students} />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard stats={stats} classes={classes} students={students} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isLoading={isLoading} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser!} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
