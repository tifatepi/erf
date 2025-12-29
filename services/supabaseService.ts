
import { supabase } from '../lib/supabase';
import { Student, Payment, ClassSession, User, UserRole } from '../types';

export const db = {
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
    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) return null;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatar: data.avatar_url
      } as User;
    },
    async create(profile: Partial<User>) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar_url: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`
        }])
        .select();
      
      if (error) throw error;
      
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role as UserRole,
        avatar: data[0].avatar_url
      } as User;
    },
    async update(id: string, updates: Partial<User>) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          role: updates.role,
          avatar_url: updates.avatar
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
        .insert([student])
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
        .insert([payment])
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
        .insert([classData])
        .select();
      if (error) throw error;
      return data[0] as ClassSession;
    }
  }
};
