
import React from 'react';
import { UserRole, User, Student, Payment, ClassSession } from './types';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const APP_NAME = "EduBoost";

export const MOCK_USER: User = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.admin@eduboost.com.br',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/200'
};

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'João Oliveira', age: 12, grade: '7º Ano', school: 'Escola Municipal Central', guardianId: 'r1', subjects: ['Matemática', 'Português'] },
  { id: 's2', name: 'Mariana Costa', age: 10, grade: '5º Ano', school: 'Colégio Adventista', guardianId: 'r2', subjects: ['História', 'Geografia'] },
  { id: 's3', name: 'Pedro Santos', age: 15, grade: '9º Ano', school: 'IFSP', guardianId: 'r1', subjects: ['Física', 'Química'] },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: 's1', amount: 350.00, dueDate: '2023-11-10', status: 'PAID', description: 'Mensalidade Novembro' },
  { id: 'p2', studentId: 's2', amount: 420.00, dueDate: '2023-11-15', status: 'PENDING', description: 'Mensalidade Novembro' },
  { id: 'p3', studentId: 's3', amount: 350.00, dueDate: '2023-11-05', status: 'OVERDUE', description: 'Mensalidade Novembro' },
];

export const MOCK_CLASSES: ClassSession[] = [
  { id: 'c1', subject: 'Matemática', teacherId: 't1', studentId: 's1', date: '2023-11-20', time: '14:00', status: 'SCHEDULED' },
  { id: 'c2', subject: 'Física', teacherId: 't1', studentId: 's3', date: '2023-11-20', time: '15:30', status: 'SCHEDULED' },
  { id: 'c3', subject: 'Português', teacherId: 't2', studentId: 's1', date: '2023-11-21', time: '09:00', status: 'COMPLETED', notes: 'João demonstrou facilidade com sintaxe.' },
];

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'students', label: 'Alunos', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
  { id: 'academic', label: 'Acadêmico', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'calendar', label: 'Agenda', icon: <Calendar size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} />, roles: [UserRole.ADMIN, UserRole.RESPONSAVEL] },
  { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} />, roles: [UserRole.ADMIN] },
];
