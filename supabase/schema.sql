-- Create custom enum for priority and status
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'missed');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekdays', 'weekends', 'weekly');

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority task_priority DEFAULT 'medium',
  estimated_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'missed'
  completed_at TIMESTAMPTZ,
  scheduled_date DATE,
  start_time TEXT,
  end_time TEXT,
  is_habit_instance BOOLEAN DEFAULT FALSE,
  habit_id TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_minutes INTEGER DEFAULT 15,
  preferred_time TEXT,
  frequency habit_frequency DEFAULT 'daily',
  streak INTEGER DEFAULT 0,
  completed_dates TEXT[] DEFAULT '{}',
  missed_dates TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'Sparkles',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Allow public access for single-user/demo or connect with auth.uid()
CREATE POLICY "Public full access on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Public full access on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Public full access on habits" ON habits FOR ALL USING (true);
