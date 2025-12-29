
import { supabase } from '../lib/supabase';
import { Student, Payment, ClassSession, User, UserRole } from '../types';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const db = {
  auth: {
    async login(email: string, password: string): Promise<User | null> {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();
        
        if (error || !data) return null;
        
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatar: data.avatar_url
        };
      } catch (e) {
        console.error("Login crash:", e);
        return null;
      }
    }
  },
  profiles: {
    async list() {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role as UserRole,
        avatar: p.avatar_url
      })) as User[];
    },
    async create(profile: Partial<User & { password?: string }>) {
      const { data, error } = await supabase.from('profiles').insert([{
        id: generateId(),
        name: profile.name,
        email: profile.email,
        role: profile.role,
        password: profile.password || '123456',
        avatar_url: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'user')}`
      }]).select();
      if (error) throw error;
      return { 
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role as UserRole,
        avatar: data[0].avatar_url 
      } as User;
    },
    async delete(id: string) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
  },
  students: {
    async list() {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        birthDate: s.birth_date, 
        grade: s.grade,
        school: s.school,
        subjects: s.subjects || [],
        guardianId: s.guardian_id
      })) as Student[];
    },
    async create(student: Partial<Student>) {
      const { data, error } = await supabase.from('students').insert([{
        name: student.name,
        birth_date: student.birthDate,
        grade: student.grade,
        school: student.school,
        subjects: student.subjects,
        guardian_id: student.guardianId
      }]).select();
      if (error) throw error;
      return { 
        ...data[0], 
        birthDate: data[0].birth_date,
        guardianId: data[0].guardian_id
      } as Student;
    },
    async update(id: string, updates: Partial<Student>) {
      const { data, error } = await supabase.from('students').update({
        name: updates.name,
        birth_date: updates.birthDate,
        grade: updates.grade,
        school: updates.school,
        subjects: updates.subjects
      }).eq('id', id).select();
      if (error) throw error;
      return { 
        ...data[0], 
        birthDate: data[0].birth_date,
        guardianId: data[0].guardian_id
      } as Student;
    },
    async delete(id: string) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    }
  },
  payments: {
    async list() {
      const { data, error } = await supabase.from('payments').select('*').order('due_date', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => ({
        id: String(p.id),
        studentId: String(p.student_id),
        amount: Number(p.amount),
        dueDate: p.due_date,
        paymentDate: p.payment_date,
        status: p.status,
        description: p.description
      })) as Payment[];
    },
    async create(payment: Partial<Payment>) {
      const { data, error } = await supabase.from('payments').insert([{
        student_id: payment.studentId,
        amount: payment.amount,
        due_date: payment.dueDate,
        payment_date: payment.paymentDate,
        status: payment.status,
        description: payment.description
      }]).select();
      if (error) throw error;
      const p = data[0];
      return {
        id: String(p.id),
        studentId: String(p.student_id),
        amount: Number(p.amount),
        dueDate: p.due_date,
        paymentDate: p.payment_date,
        status: p.status,
        description: p.description
      } as Payment;
    }
  },
  classes: {
    async list() {
      const { data, error } = await supabase.from('classes').select('*').order('date').order('time');
      if (error) throw error;
      return (data || []).map(c => ({
        id: String(c.id),
        subject: c.subject,
        teacherId: c.teacher_id,
        studentId: String(c.student_id),
        date: c.date,
        time: c.time,
        status: c.status,
        notes: c.notes
      })) as ClassSession[];
    },
    async create(classData: Partial<ClassSession>) {
      const { data, error } = await supabase.from('classes').insert([{
        subject: classData.subject,
        teacher_id: classData.teacherId,
        student_id: classData.studentId,
        date: classData.date,
        time: classData.time,
        status: classData.status,
        notes: classData.notes
      }]).select();
      if (error) throw error;
      
      const c = data[0];
      return {
        id: String(c.id),
        subject: c.subject,
        teacherId: c.teacher_id,
        studentId: String(c.student_id),
        date: c.date,
        time: c.time,
        status: c.status,
        notes: c.notes
      } as ClassSession;
    },
    async update(id: string, updates: Partial<ClassSession>) {
      const { data, error } = await supabase.from('classes').update({
        subject: updates.subject,
        student_id: updates.studentId,
        date: updates.date,
        time: updates.time,
        notes: updates.notes,
        status: updates.status
      }).eq('id', id).select();
      if (error) throw error;
      
      const c = data[0];
      return {
        id: String(c.id),
        subject: c.subject,
        teacherId: c.teacher_id,
        studentId: String(c.student_id),
        date: c.date,
        time: c.time,
        status: c.status,
        notes: c.notes
      } as ClassSession;
    },
    async delete(id: string | number) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  }
};
