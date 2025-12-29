
import { supabase } from '../lib/supabase';
import { Student, Payment, ClassSession, User, UserRole } from '../types';

export const db = {
  auth: {
    async login(email: string, password: string): Promise<User | null> {
      // Busca direta na tabela profiles usando e-mail e senha
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      
      if (error || !data) {
        console.error("Erro ou falha no login:", error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatar: data.avatar_url
      };
    }
  },
  profiles: {
    async list() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url
      })) as User[];
    },
    async create(profile: Partial<User & { password?: string }>) {
      // Geramos um UUID para o ID caso o banco não gere, e definimos senha padrão
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          name: profile.name,
          email: profile.email,
          role: profile.role,
          password: profile.password || '123456',
          avatar_url: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'user')}`
        }])
        .select();
      
      if (error) {
        console.error("Erro ao criar perfil:", error);
        throw error;
      }
      
      const created = data[0];
      return {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role as UserRole,
        avatar: created.avatar_url
      } as User;
    },
    async update(id: string, updates: Partial<User & { password?: string }>) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          role: updates.role,
          avatar_url: updates.avatar,
          ...(updates.password ? { password: updates.password } : {})
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  students: {
    async list() {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Student[];
    },
    async create(student: Partial<Student>) {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: student.name,
          age: student.age,
          grade: student.grade,
          school: student.school,
          subjects: student.subjects,
          guardian_id: student.guardianId
        }])
        .select();
      if (error) throw error;
      return data[0] as Student;
    }
  },
  payments: {
    async list() {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    async create(payment: Partial<Payment>) {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          student_id: payment.studentId,
          amount: payment.amount,
          due_date: payment.dueDate,
          status: payment.status,
          description: payment.description
        }])
        .select();
      if (error) throw error;
      return data[0] as Payment;
    }
  },
  classes: {
    async list() {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date')
        .order('time');
      if (error) throw error;
      return data as ClassSession[];
    },
    async create(classData: Partial<ClassSession>) {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          subject: classData.subject,
          teacher_id: classData.teacherId,
          student_id: classData.studentId,
          date: classData.date,
          time: classData.time,
          status: classData.status,
          notes: classData.notes
        }])
        .select();
      if (error) throw error;
      return data[0] as ClassSession;
    }
  }
};
