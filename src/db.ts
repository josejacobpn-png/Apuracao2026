import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || ''; // Recomenda-se a role_key (service_role) para uso no backend

if (!supabaseUrl || !supabaseKey) {
    console.warn("ATENÇÃO: SUPABASE_URL e SUPABASE_KEY não foram definidos no arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
