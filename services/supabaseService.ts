
import { supabase } from '../lib/supabase';
import { Student, Payment, ClassSession, User, UserRole, Institution, Teacher, Turma, AttendanceRecord } from '../types';

// Utilitário para simular delay de rede e persistência local para testes
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300));

const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(`eduboost_${key}`);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(`eduboost_${key}`, JSON.stringify(data));
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
        
        if (error || !data) {
          // Fallback para login admin de teste se falhar rede ou registro não existir
          if (email === 'admin@eduboost.com.br' && password === 'qwe123') {
            return { id: 'mock-admin', name: 'Administrador (Offline)', email, role: UserRole.ADMIN };
          }
          return null;
        }
        
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatar: data.avatar_url
        };
      } catch (e) {
        if (email === 'admin@eduboost.com.br' && password === 'qwe123') {
          return { id: 'mock-admin', name: 'Administrador (Offline)', email, role: UserRole.ADMIN };
        }
        return null;
      }
    }
  },
  profiles: {
    async list() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('name');
        if (error) throw error;
        return (data || []).map(p => ({
          id: p.id, name: p.name, email: p.email, role: p.role as UserRole, avatar: p.avatar_url
        })) as User[];
      } catch (e) {
        return getLocal<User[]>('profiles', []);
      }
    },
    async create(profile: any) {
      try {
        const { data, error } = await supabase.from('profiles').insert([{
          name: profile.name, email: profile.email, role: profile.role, password: profile.password, avatar_url: profile.avatar
        }]).select();
        if (error) throw error;
        return data[0] as User;
      } catch (e) {
        const users = getLocal<User[]>('profiles', []);
        const newUser = { id: Math.random().toString(), ...profile };
        setLocal('profiles', [...users, newUser]);
        return newUser;
      }
    },
    async delete(id: string) {
      try { await supabase.from('profiles').delete().eq('id', id); }
      catch (e) {
        const users = getLocal<User[]>('profiles', []);
        setLocal('profiles', users.filter(u => u.id !== id));
      }
    }
  },
  institutions: {
    async list() {
      try {
        const { data, error } = await supabase.from('institutions').select('*').order('name');
        if (error) throw error;
        return (data || []).map(i => ({
          id: String(i.id), name: i.name, cnpj: i.cnpj, contactName: i.contact_name, contactPhone: i.contact_phone
        })) as Institution[];
      } catch (e) {
        return getLocal<Institution[]>('institutions', [
          { id: '1', name: 'Colégio Objetivo', cnpj: '00.000.000/0001-01', contactName: 'Diretoria', contactPhone: '(11) 99999-0001' }
        ]);
      }
    },
    async create(inst: Partial<Institution>) {
      try {
        const { data, error } = await supabase.from('institutions').insert([{
          name: inst.name, cnpj: inst.cnpj, contact_name: inst.contactName, contact_phone: inst.contactPhone
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Institution[]>('institutions', []);
        const newItem = { id: Math.random().toString(), ...inst } as Institution;
        setLocal('institutions', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, inst: Partial<Institution>) {
      try {
        const { data, error } = await supabase.from('institutions').update({
          name: inst.name, cnpj: inst.cnpj, contact_name: inst.contactName, contact_phone: inst.contactPhone
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Institution[]>('institutions', []);
        const updated = items.map(i => i.id === id ? { ...i, ...inst } : i);
        setLocal('institutions', updated);
        return updated.find(i => i.id === id);
      }
    },
    async delete(id: string) {
      try { await supabase.from('institutions').delete().eq('id', id); }
      catch (e) {
        const items = getLocal<Institution[]>('institutions', []);
        setLocal('institutions', items.filter(i => i.id !== id));
      }
    }
  },
  teachers: {
    async list() {
      try {
        const { data, error } = await supabase.from('teachers').select('*').order('name');
        if (error) throw error;
        return (data || []).map(t => ({
          id: String(t.id), name: t.name, cpf: t.cpf, education: t.education, phone: t.phone
        })) as Teacher[];
      } catch (e) {
        return getLocal<Teacher[]>('teachers', [
          { id: '1', name: 'Prof. Carlos Alberto', cpf: '123.456.789-00', education: 'Matemática', phone: '(11) 98888-7777' }
        ]);
      }
    },
    async create(teacher: Partial<Teacher>) {
      try {
        const { data, error } = await supabase.from('teachers').insert([{
          name: teacher.name, cpf: teacher.cpf, education: teacher.education, phone: teacher.phone
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Teacher[]>('teachers', []);
        const newItem = { id: Math.random().toString(), ...teacher } as Teacher;
        setLocal('teachers', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, teacher: Partial<Teacher>) {
      try {
        const { data, error } = await supabase.from('teachers').update({
          name: teacher.name, cpf: teacher.cpf, education: teacher.education, phone: teacher.phone
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Teacher[]>('teachers', []);
        const updated = items.map(i => i.id === id ? { ...i, ...teacher } : i);
        setLocal('teachers', updated);
        return updated.find(i => i.id === id);
      }
    },
    async delete(id: string) {
      try { await supabase.from('teachers').delete().eq('id', id); }
      catch (e) {
        const items = getLocal<Teacher[]>('teachers', []);
        setLocal('teachers', items.filter(i => i.id !== id));
      }
    }
  },
  students: {
    async list() {
      try {
        const { data, error } = await supabase.from('students').select('*').order('name');
        if (error) throw error;
        return (data || []).map(s => ({
          id: String(s.id), name: s.name, birthDate: s.birth_date, grade: s.grade, school: s.school, subjects: s.subjects || [], monthlyFee: Number(s.monthly_fee || 0)
        })) as Student[];
      } catch (e) {
        return getLocal<Student[]>('students', [
          { id: '1', name: 'Lucas Gabriel', birthDate: '2010-05-15', grade: '7º Ano (Fund II)', school: 'Colégio Objetivo', subjects: ['Matemática'], monthlyFee: 350, guardianId: 'g1' }
        ]);
      }
    },
    async create(student: Partial<Student>) {
      try {
        const { data, error } = await supabase.from('students').insert([{
          name: student.name, birth_date: student.birthDate, grade: student.grade, school: student.school, subjects: student.subjects, monthly_fee: student.monthlyFee || 0
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Student[]>('students', []);
        const newItem = { id: Math.random().toString(), ...student } as Student;
        setLocal('students', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, student: Partial<Student>) {
      try {
        const { data, error } = await supabase.from('students').update({
          name: student.name, birth_date: student.birthDate, grade: student.grade, school: student.school, subjects: student.subjects, monthly_fee: student.monthlyFee
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Student[]>('students', []);
        const updated = items.map(i => i.id === id ? { ...i, ...student } : i);
        setLocal('students', updated);
        return updated.find(i => i.id === id);
      }
    }
  },
  turmas: {
    async list() {
      try {
        const { data, error } = await supabase.from('turmas').select('*').order('name');
        if (error) throw error;
        return (data || []).map(t => ({
          id: String(t.id), name: t.name, subject: t.subject, teacherId: t.teacher_id, studentIds: t.student_ids || []
        })) as Turma[];
      } catch (e) {
        return getLocal<Turma[]>('turmas', [
          { id: '1', name: 'Turma A - Tarde', subject: 'Matemática', teacherId: '1', studentIds: ['1'] }
        ]);
      }
    },
    async create(turma: Partial<Turma>) {
      try {
        const { data, error } = await supabase.from('turmas').insert([{
          name: turma.name, subject: turma.subject, teacher_id: turma.teacherId, student_ids: turma.studentIds
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Turma[]>('turmas', []);
        const newItem = { id: Math.random().toString(), ...turma } as Turma;
        setLocal('turmas', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, turma: Partial<Turma>) {
      try {
        const { data, error } = await supabase.from('turmas').update({
          name: turma.name, subject: turma.subject, teacher_id: turma.teacherId, student_ids: turma.studentIds
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Turma[]>('turmas', []);
        const updated = items.map(i => i.id === id ? { ...i, ...turma } : i);
        setLocal('turmas', updated);
        return updated.find(i => i.id === id);
      }
    },
    async delete(id: string) {
      try { await supabase.from('turmas').delete().eq('id', id); }
      catch (e) {
        const items = getLocal<Turma[]>('turmas', []);
        setLocal('turmas', items.filter(i => i.id !== id));
      }
    }
  },
  attendance: {
    async list() {
      try {
        const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(a => ({
          id: a.id, turmaId: a.turma_id, date: a.date, presentStudentIds: a.present_student_ids || []
        })) as AttendanceRecord[];
      } catch (e) {
        return getLocal<AttendanceRecord[]>('attendance', []);
      }
    },
    async getByTurmaAndDate(turmaId: string, date: string) {
      try {
        const { data, error } = await supabase.from('attendance').select('*').eq('turma_id', turmaId).eq('date', date).maybeSingle();
        if (error) throw error;
        return data ? { id: data.id, turmaId: data.turma_id, date: data.date, presentStudentIds: data.present_student_ids || [] } : null;
      } catch (e) {
        const items = getLocal<AttendanceRecord[]>('attendance', []);
        return items.find(i => i.turmaId === turmaId && i.date === date) || null;
      }
    },
    async save(record: Partial<AttendanceRecord>) {
      try {
        const { data, error } = await supabase.from('attendance').upsert([{
          turma_id: record.turmaId, date: record.date, present_student_ids: record.presentStudentIds
        }], { onConflict: 'turma_id,date' }).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<AttendanceRecord[]>('attendance', []);
        const index = items.findIndex(i => i.turmaId === record.turmaId && i.date === record.date);
        const newItem = { id: Math.random().toString(), ...record } as AttendanceRecord;
        if (index >= 0) items[index] = newItem;
        else items.push(newItem);
        setLocal('attendance', items);
        return newItem;
      }
    }
  },
  payments: {
    async list() {
      try {
        const { data, error } = await supabase.from('payments').select('*').order('due_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(p => ({
          id: String(p.id), studentId: String(p.student_id), amount: Number(p.amount), dueDate: p.due_date, paymentDate: p.payment_date, status: p.status, description: p.description
        })) as Payment[];
      } catch (e) {
        return getLocal<Payment[]>('payments', [
          { id: '1', studentId: '1', amount: 350, dueDate: '2024-02-10', status: 'PENDING', description: 'Mensalidade Fevereiro' }
        ]);
      }
    },
    async create(payment: Partial<Payment>) {
      try {
        const { data, error } = await supabase.from('payments').insert([{
          student_id: payment.studentId, amount: payment.amount, due_date: payment.dueDate, status: payment.status, description: payment.description
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Payment[]>('payments', []);
        const newItem = { id: Math.random().toString(), ...payment } as Payment;
        setLocal('payments', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, updates: Partial<Payment>) {
      try {
        const { data, error } = await supabase.from('payments').update({
          status: updates.status, payment_date: updates.paymentDate
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<Payment[]>('payments', []);
        const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
        setLocal('payments', updated);
        return updated.find(i => i.id === id);
      }
    }
  },
  classes: {
    async list() {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('date').order('time');
        if (error) throw error;
        return (data || []).map(c => ({
          id: String(c.id), subject: c.subject, teacherId: c.teacher_id, studentId: String(c.student_id), date: c.date, time: c.time, status: c.status, notes: c.notes
        })) as ClassSession[];
      } catch (e) {
        return getLocal<ClassSession[]>('classes', []);
      }
    },
    async create(session: Partial<ClassSession>) {
      try {
        const { data, error } = await supabase.from('classes').insert([{
          subject: session.subject, teacher_id: session.teacherId, student_id: session.studentId, date: session.date, time: session.time, status: session.status, notes: session.notes
        }]).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<ClassSession[]>('classes', []);
        const newItem = { id: Math.random().toString(), ...session } as ClassSession;
        setLocal('classes', [...items, newItem]);
        return newItem;
      }
    },
    async update(id: string, session: Partial<ClassSession>) {
      try {
        const { data, error } = await supabase.from('classes').update({
          notes: session.notes, status: session.status
        }).eq('id', id).select();
        if (error) throw error;
        return data[0];
      } catch (e) {
        const items = getLocal<ClassSession[]>('classes', []);
        const updated = items.map(i => i.id === id ? { ...i, ...session } : i);
        setLocal('classes', updated);
        return updated.find(i => i.id === id);
      }
    },
    async delete(id: string) {
      try { await supabase.from('classes').delete().eq('id', id); }
      catch (e) {
        const items = getLocal<ClassSession[]>('classes', []);
        setLocal('classes', items.filter(i => i.id !== id));
      }
    }
  }
};
