
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

export interface Student {
  id: string;
  name: string;
  birthDate: string; // ISO Date String
  grade: string;
  school: string;
  guardianId: string;
  subjects: string[];
  monthlyFee?: number; // Novo campo para valor da mensalidade
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
