
import React from 'react';
import { UserRole, User, Student, Payment, ClassSession } from './types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  UserCog,
  Building2,
  Contact,
  Shapes
} from 'lucide-react';

export const APP_NAME = "EduBoost";

export const MOCK_USER: User = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.admin@eduboost.com.br',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/200'
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'institutions', label: 'Instituições', icon: <Building2 size={20} />, roles: [UserRole.ADMIN] },
  { id: 'teachers', label: 'Docentes', icon: <Contact size={20} />, roles: [UserRole.ADMIN] },
  { id: 'students', label: 'Alunos', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
  { id: 'turmas', label: 'Turmas', icon: <Shapes size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
  { id: 'academic', label: 'Acadêmico', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'calendar', label: 'Agenda', icon: <Calendar size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} />, roles: [UserRole.ADMIN, UserRole.RESPONSAVEL] },
  { id: 'users', label: 'Usuários', icon: <UserCog size={20} />, roles: [UserRole.ADMIN] },
  { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} />, roles: [UserRole.ADMIN] },
];
