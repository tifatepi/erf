
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjttgxxwggtdlzskmtri.supabase.co';
const supabaseAnonKey = 'sb_publishable_F4tUBDm1jS6eYe21lYotcQ_mosC_Yzd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
