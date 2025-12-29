
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpdwmstbnpibpxwxbrog.supabase.co';
const supabaseAnonKey = 'sb_publishable_99ZaNlZenF3fCruoRj0AtQ_bsIRTRfN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
