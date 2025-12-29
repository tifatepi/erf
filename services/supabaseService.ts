
import { supabase } from '../lib/supabase';
import { Student, Payment, ClassSession, User, UserRole, Institution, Teacher } from '../types';

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
    async create(profile: any) {
      const { data, error } = await supabase.from('profiles').insert([{
        name: profile.name,
        email: profile.email,
        role: profile.role,
        password: profile.password,
        avatar_url: profile.avatar
      }]).select();
      if (error) throw error;
      const p = data[0];
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role as UserRole,
        avatar: p.avatar_url
      } as User;
    },
    async delete(id: string) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
  },
  institutions: {
    async list() {
      const { data, error } = await supabase.from('institutions').select('*').order('name');
      if (error) throw error;
      return (data || []).map(i => ({
        id: String(i.id),
        name: i.name,
        cnpj: i.cnpj,
        contactName: i.contact_name,
        contactPhone: i.contact_phone
      })) as Institution[];
    },
    async create(inst: Partial<Institution>) {
      const { data, error } = await supabase.from('institutions').insert([{
        name: inst.name,
        cnpj: inst.cnpj,
        contact_name: inst.contactName,
        contact_phone: inst.contactPhone
      }]).select();
      if (error) throw error;
      const i = data[0];
      return { id: String(i.id), name: i.name, cnpj: i.cnpj, contactName: i.contact_name, contactPhone: i.contact_phone } as Institution;
    },
    async update(id: string, inst: Partial<Institution>) {
      const { data, error } = await supabase.from('institutions').update({
        name: inst.name,
        cnpj: inst.cnpj,
        contact_name: inst.contactName,
        contact_phone: inst.contactPhone
      }).eq('id', id).select();
      if (error) throw error;
      const i = data[0];
      return { id: String(i.id), name: i.name, cnpj: i.cnpj, contactName: i.contact_name, contactPhone: i.contact_phone } as Institution;
    },
    async delete(id: string) {
      const { error } = await supabase.from('institutions').delete().eq('id', id);
      if (error) throw error;
    }
  },
  teachers: {
    async list() {
      const { data, error } = await supabase.from('teachers').select('*').order('name');
      if (error) throw error;
      return (data || []).map(t => ({
        id: String(t.id),
        name: t.name,
        cpf: t.cpf,
        education: t.education,
        phone: t.phone
      })) as Teacher[];
    },
    async create(teacher: Partial<Teacher>) {
      const { data, error } = await supabase.from('teachers').insert([{
        name: teacher.name,
        cpf: teacher.cpf,
        education: teacher.education,
        phone: teacher.phone
      }]).select();
      if (error) throw error;
      const t = data[0];
      return { id: String(t.id), name: t.name, cpf: t.cpf, education: t.education, phone: t.phone } as Teacher;
    },
    async update(id: string, teacher: Partial<Teacher>) {
      const { data, error } = await supabase.from('teachers').update({
        name: teacher.name,
        cpf: teacher.cpf,
        education: teacher.education,
        phone: teacher.phone
      }).eq('id', id).select();
      if (error) throw error;
      const t = data[0];
      return { id: String(t.id), name: t.name, cpf: t.cpf, education: t.education, phone: t.phone } as Teacher;
    },
    async delete(id: string) {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
    }
  },
  students: {
    async list() {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      return (data || []).map(s => ({
        id: String(s.id),
        name: s.name,
        birthDate: s.birth_date, 
        grade: s.grade,
        school: s.school,
        subjects: s.subjects || [],
        monthlyFee: Number(s.monthly_fee || 0)
      })) as Student[];
    },
    async create(student: Partial<Student>) {
      const { data, error } = await supabase.from('students').insert([{
        name: student.name,
        birth_date: student.birthDate,
        grade: student.grade,
        school: student.school,
        subjects: student.subjects,
        monthly_fee: student.monthlyFee || 0
      }]).select();
      if (error) throw error;
      const s = data[0];
      return {
        id: String(s.id),
        name: s.name,
        birthDate: s.birth_date, 
        grade: s.grade,
        school: s.school,
        subjects: s.subjects || [],
        monthlyFee: Number(s.monthly_fee || 0)
      } as Student;
    },
    async update(id: string, student: Partial<Student>) {
      const { data, error } = await supabase.from('students').update({
        name: student.name,
        birth_date: student.birthDate,
        grade: student.grade,
        school: student.school,
        subjects: student.subjects,
        monthly_fee: student.monthlyFee
      }).eq('id', id).select();
      if (error) throw error;
      const s = data[0];
      return {
        id: String(s.id),
        name: s.name,
        birthDate: s.birth_date, 
        grade: s.grade,
        school: s.school,
        subjects: s.subjects || [],
        monthlyFee: Number(s.monthly_fee || 0)
      } as Student;
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
      // Verificação de ID numérico para o banco de dados
      const studentIdNum = parseInt(payment.studentId || '0');
      
      const payload = {
        student_id: studentIdNum,
        amount: payment.amount,
        due_date: payment.dueDate,
        payment_date: payment.status === 'PAID' ? (payment.paymentDate || new Date().toISOString().split('T')[0]) : null,
        status: payment.status,
        description: payment.description
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([payload])
        .select();
      
      if (error) {
        console.error("Erro detalhado no Supabase:", error);
        throw error;
      }
      
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
    },
    async update(id: string, updates: Partial<Payment>) {
      const payload: any = {
        status: updates.status,
        amount: updates.amount,
        description: updates.description,
        due_date: updates.dueDate,
        payment_date: updates.status === 'PAID' ? (updates.paymentDate || new Date().toISOString().split('T')[0]) : null
      };

      const { data, error } = await supabase
        .from('payments')
        .update(payload)
        .eq('id', id)
        .select();
      
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
    async create(session: Partial<ClassSession>) {
      const { data, error } = await supabase.from('classes').insert([{
        subject: session.subject,
        teacher_id: session.teacherId,
        student_id: parseInt(session.studentId || '0'),
        date: session.date,
        time: session.time,
        status: session.status,
        notes: session.notes
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
    async update(id: string, session: Partial<ClassSession>) {
      const { data, error } = await supabase.from('classes').update({
        subject: session.subject,
        date: session.date,
        time: session.time,
        status: session.status,
        notes: session.notes
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
    async delete(id: string) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
