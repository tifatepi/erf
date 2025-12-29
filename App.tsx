
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import FinancialList from './components/FinancialList';
import AcademicView from './components/AcademicView';
import CalendarView from './components/CalendarView';
import Login from './components/Login';
import { UserRole, Student, Payment, ClassSession } from './types';
import { MOCK_STUDENTS, MOCK_PAYMENTS, MOCK_CLASSES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  
  // Simulated Database State
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [classes, setClasses] = useState<ClassSession[]>(MOCK_CLASSES);

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

  const handleLogin = (role: string) => {
    setUserRole(role as UserRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    console.log("Sessão encerrada");
  };

  const addStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, { ...newStudent, id: `s${prev.length + 1}` }]);
  };

  const addPayment = (newPayment: Payment) => {
    setPayments(prev => [...prev, { ...newPayment, id: `p${prev.length + 1}` }]);
  };

  const renderContent = () => {
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
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="bg-indigo-100 p-8 rounded-full text-indigo-600">
              <span className="text-4xl font-bold">PDF</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Relatórios Gerenciais</h3>
            <p className="text-slate-500 max-w-md">Relatórios consolidados prontos para exportação.</p>
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
      userRole={userRole} 
      setUserRole={setUserRole}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
