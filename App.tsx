
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import FinancialList from './components/FinancialList';
import AcademicView from './components/AcademicView';
import CalendarView from './components/CalendarView';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { UserRole, Student, Payment, ClassSession, User } from './types';
import { db } from './services/supabaseService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
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
      const [sData, pData, cData] = await Promise.all([
        db.students.list().catch(() => []),
        db.payments.list().catch(() => []),
        db.classes.list().catch(() => [])
      ]);
      setStudents(sData || []);
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

  const addStudent = async (newStudent: Partial<Student>) => {
    try {
      const created = await db.students.create(newStudent);
      setStudents(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao salvar aluno");
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await db.students.update(id, updates);
      setStudents(prev => (prev || []).map(s => s.id === id ? updated : s));
    } catch (err) {
      alert("Erro ao atualizar aluno");
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
      case 'students':
        return <StudentList students={students} onAddStudent={addStudent} onUpdateStudent={updateStudent} />;
      case 'financial':
        return <FinancialList payments={payments} students={students} onAddPayment={addPayment} />;
      case 'calendar':
        return <CalendarView classes={classes} students={students} />;
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
