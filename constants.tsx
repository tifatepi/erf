
import React from 'react';
import { UserRole, User } from './types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  UserCog,
  Building2,
  Contact,
  Shapes,
  FileBarChart,
  ClipboardList,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const APP_NAME = "EduBoost";

export const MOCK_USER: User = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.admin@eduboost.com.br',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/200'
};

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'teacher-area', label: 'Área Docente', icon: <ClipboardList size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
  
  // Novo Módulo Agrupador: Acadêmico
  { 
    id: 'academic-group', 
    label: 'Acadêmico', 
    icon: <GraduationCap size={20} />, 
    roles: [UserRole.ADMIN, UserRole.PROFESSOR],
    children: [
      { id: 'students', label: 'Alunos', icon: <Users size={18} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
      { id: 'turmas', label: 'Turmas', icon: <Shapes size={18} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
      { id: 'teachers', label: 'Docentes', icon: <Contact size={18} />, roles: [UserRole.ADMIN] },
    ]
  },

  { id: 'calendar', label: 'Agenda', icon: <Calendar size={20} />, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
  { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} />, roles: [UserRole.ADMIN, UserRole.RESPONSAVEL] },
  { id: 'delinquency', label: 'Inadimplência', icon: <AlertCircle size={20} />, roles: [UserRole.ADMIN] },
  { id: 'reports', label: 'Relatórios', icon: <FileBarChart size={20} />, roles: [UserRole.ADMIN] },
  { id: 'institutions', label: 'Instituições', icon: <Building2 size={20} />, roles: [UserRole.ADMIN] },
  { id: 'users', label: 'Usuários', icon: <UserCog size={20} />, roles: [UserRole.ADMIN] },
];
