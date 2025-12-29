
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Real Database State
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadAllData();
    }
  }, [isAuthenticated, currentUser]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sData, pData, cData] = await Promise.all([
        db.students.list(),
        db.payments.list(),
        db.classes.list()
      ]);
      setStudents(sData);
      setPayments(pData);
      setClasses(cData);
    } catch (error) {
      console.error("Erro ao carregar dados do Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCount = payments.filter(p => p.status !== 'PAID').length;
    
    return {
      totalStudents: students.length,
      classesDone: classes.filter(c => c.status === 'COMPLETED').length,
      revenue: totalRevenue,
      pending: pendingCount
    };
  }, [students, payments, classes]);

  const handleLogin = async (role: string, email?: string) => {
    setIsLoading(true);
    try {
      // Tenta buscar o perfil real no Supabase pelo e-mail (ou usa mock se não encontrar/informar)
      const profile = email ? await db.profiles.getByEmail(email) : null;
      
      if (profile) {
        setCurrentUser(profile);
      } else {
        // Fallback para desenvolvimento caso o usuário ainda não exista no profiles
        setCurrentUser({
          id: 'temp-admin',
          name: 'Administrador EduBoost',
          email: email || 'admin@eduboost.com.br',
          role: role as UserRole,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        });
      }
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erro no login:", err);
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

  const addPayment = async (newPayment: Partial<Payment>) => {
    try {
      const created = await db.payments.create(newPayment);
      setPayments(prev => [...prev, created]);
    } catch (err) {
      alert("Erro ao processar pagamento");
    }
  };

  const renderContent = () => {
    if (isLoading && isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Sincronizando dados acadêmicos...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} classes={classes} students={students} />;
      case 'students':
        return <StudentList students={students} onAddStudent={addStudent} />;
      case 'financial':
        return <FinancialList payments={payments} students={students} onAddPayment={addPayment} />;
      case 'calendar':
        return <CalendarView classes={classes} students={students} />;
      case 'academic':
        return <AcademicView students={students} />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="bg-indigo-100 p-8 rounded-full text-indigo-600">
              <span className="text-4xl font-bold">PDF</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Relatórios Gerenciais</h3>
            <p className="text-slate-500 max-w-md">Relatórios consolidados sincronizados em tempo real.</p>
            <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
              Gerar PDF Consolidado
            </button>
          </div>
        );
      default:
        return <Dashboard stats={stats} classes={classes} students={students} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={currentUser!}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
