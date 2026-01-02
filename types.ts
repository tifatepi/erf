
export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR',
  RESPONSAVEL = 'RESPONSAVEL',
  ALUNO = 'ALUNO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Institution {
  id: string;
  name: string;
  cnpj: string;
  contactName: string;
  contactPhone: string;
}

export interface Teacher {
  id: string;
  name: string;
  cpf: string;
  education: string;
  phone: string;
}

export interface Student {
  id: string;
  name: string;
  birthDate: string; // ISO Date String
  grade: string;
  school: string;
  guardianId: string;
  subjects: string[];
  monthlyFee?: number;
}

export interface Turma {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  turmaId: string;
  date: string;
  presentStudentIds: string[];
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string; 
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  description: string;
}

export interface ClassSession {
  id: string;
  subject: string;
  teacherId: string;
  studentId: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface AcademicPerformance {
  studentId: string;
  subject: string;
  grade: number;
  date: string;
  observation: string;
}
