import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Create a .env.local file with:
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Database table schemas (for reference):
 *
 * 1. users table (extends auth.users)
 * - id: uuid (primary key)
 * - email: text
 * - created_at: timestamp
 *
 * 2. transactions table
 * - id: integer (primary key)
 * - user_id: uuid (foreign key to auth.users)
 * - description: text
 * - amount: numeric
 * - category: text
 * - type: text ('expense' or 'income')
 * - currency: text
 * - date: date
 * - person: text
 * - created_at: timestamp
 * - updated_at: timestamp
 *
 * 3. goals table
 * - id: text (primary key)
 * - user_id: uuid (foreign key to auth.users)
 * - name: text
 * - type: text ('savings' or 'budget')
 * - target: numeric
 * - currency: text
 * - deadline: date (nullable)
 * - status: text ('active' or 'completed')
 * - color: text
 * - created_at: timestamp
 * - updated_at: timestamp
 *
 * 4. deposits table
 * - id: text (primary key)
 * - goal_id: text (foreign key to goals)
 * - amount: numeric
 * - currency: text
 * - date: date
 * - note: text
 * - person: text
 * - created_at: timestamp
 */
