/*
  # Math Mystery Island - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for Math Mystery Island,
  an educational game where students solve math puzzles to explore a virtual island.

  ## New Tables

  ### 1. profiles
  Extends auth.users with game-specific user data
  - `id` (uuid, FK to auth.users)
  - `role` (enum: student, teacher, parent)
  - `username` (unique display name)
  - `grade_level` (integer: 3-10)
  - `total_gems` (integer: math gems currency)
  - `created_at` (timestamp)

  ### 2. avatars
  Stores user avatar customization
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `body_type` (text)
  - `skin_color` (text)
  - `hair_style` (text)
  - `outfit` (text)
  - `accessories` (jsonb array)
  - `updated_at` (timestamp)

  ### 3. zones
  The four main island zones
  - `id` (uuid, primary key)
  - `name` (text: Geometry Glacier, Algebra Archipelago, etc.)
  - `description` (text)
  - `unlock_requirement` (integer: puzzles needed)
  - `order_index` (integer)
  - `icon` (text)

  ### 4. puzzles
  All math puzzles in the game
  - `id` (uuid, primary key)
  - `zone_id` (uuid, FK to zones)
  - `title` (text)
  - `description` (text)
  - `puzzle_type` (enum: door_riddle, bridge_building, treasure_map, pattern_path, environmental)
  - `difficulty` (integer: 1-5)
  - `grade_level` (integer: 3-10)
  - `math_concept` (text: algebra, geometry, etc.)
  - `problem_data` (jsonb: question, options, solution)
  - `hints` (jsonb array: 3 levels)
  - `gems_reward` (integer)
  - `time_estimate` (integer: minutes)
  - `created_at` (timestamp)

  ### 5. user_progress
  Tracks individual puzzle completion
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `puzzle_id` (uuid, FK to puzzles)
  - `completed` (boolean)
  - `attempts` (integer)
  - `hints_used` (integer)
  - `time_spent` (integer: seconds)
  - `solution_path` (jsonb: saved work)
  - `completed_at` (timestamp)

  ### 6. unlocked_zones
  Tracks which zones users have unlocked
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `zone_id` (uuid, FK to zones)
  - `unlocked_at` (timestamp)

  ### 7. achievements
  Achievement/badge definitions
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `icon` (text)
  - `category` (text: speed, accuracy, exploration, social)
  - `requirement` (jsonb: criteria)

  ### 8. user_achievements
  Earned achievements per user
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `achievement_id` (uuid, FK to achievements)
  - `earned_at` (timestamp)

  ### 9. teams
  Multiplayer teams for collaboration
  - `id` (uuid, primary key)
  - `name` (text)
  - `created_by` (uuid, FK to profiles)
  - `max_members` (integer)
  - `created_at` (timestamp)

  ### 10. team_members
  Team membership tracking
  - `id` (uuid, primary key)
  - `team_id` (uuid, FK to teams)
  - `user_id` (uuid, FK to profiles)
  - `joined_at` (timestamp)

  ### 11. custom_puzzles
  User-created puzzles
  - `id` (uuid, primary key)
  - `creator_id` (uuid, FK to profiles)
  - `title` (text)
  - `puzzle_data` (jsonb)
  - `difficulty` (integer)
  - `plays_count` (integer)
  - `rating` (decimal)
  - `published` (boolean)
  - `created_at` (timestamp)

  ### 12. leaderboard_entries
  Global and weekly leaderboards
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `category` (text: speed, accuracy, gems)
  - `score` (integer)
  - `week_start` (date)

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Teachers can view their students' data
  - Public read access for zones, puzzles, and achievements
*/
-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, username, role, grade_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE((NEW.raw_user_meta_data->>'grade_level')::integer, 5)
  );
  
  -- Insert into avatars table
  INSERT INTO public.avatars (user_id)
  VALUES (NEW.id);
  
  -- Unlock the first zone
  INSERT INTO public.unlocked_zones (user_id, zone_id)
  SELECT NEW.id, id 
  FROM public.zones 
  WHERE order_index = 1
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE puzzle_type AS ENUM ('door_riddle', 'bridge_building', 'treasure_map', 'pattern_path', 'environmental');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  username text UNIQUE NOT NULL,
  grade_level integer CHECK (grade_level >= 3 AND grade_level <= 10),
  total_gems integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Avatars table
CREATE TABLE IF NOT EXISTS avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  body_type text DEFAULT 'default',
  skin_color text DEFAULT '#FFD4A3',
  hair_style text DEFAULT 'short',
  outfit text DEFAULT 'casual',
  accessories jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own avatar"
  ON avatars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
  ON avatars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar"
  ON avatars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  unlock_requirement integer DEFAULT 0,
  order_index integer NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

-- Puzzles table
CREATE TABLE IF NOT EXISTS puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  puzzle_type puzzle_type NOT NULL,
  difficulty integer CHECK (difficulty >= 1 AND difficulty <= 5) NOT NULL,
  grade_level integer CHECK (grade_level >= 3 AND grade_level <= 10) NOT NULL,
  math_concept text NOT NULL,
  problem_data jsonb NOT NULL,
  hints jsonb DEFAULT '[]'::jsonb,
  gems_reward integer DEFAULT 10,
  time_estimate integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read puzzles"
  ON puzzles FOR SELECT
  TO authenticated
  USING (true);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  puzzle_id uuid REFERENCES puzzles(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  hints_used integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  solution_path jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, puzzle_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Unlocked zones table
CREATE TABLE IF NOT EXISTS unlocked_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, zone_id)
);

ALTER TABLE unlocked_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own unlocked zones"
  ON unlocked_zones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocked zones"
  ON unlocked_zones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  category text NOT NULL,
  requirement jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members integer DEFAULT 6,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT created_by FROM teams WHERE teams.id = team_id
  ));

CREATE POLICY "Users can join teams"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams"
  ON team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Custom puzzles table
CREATE TABLE IF NOT EXISTS custom_puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  puzzle_data jsonb NOT NULL,
  difficulty integer CHECK (difficulty >= 1 AND difficulty <= 5) NOT NULL,
  plays_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published puzzles"
  ON custom_puzzles FOR SELECT
  TO authenticated
  USING (published = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create own puzzles"
  ON custom_puzzles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own puzzles"
  ON custom_puzzles FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  score integer NOT NULL,
  week_start date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_puzzle_id ON user_progress(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_zone_id ON puzzles(zone_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_grade_level ON puzzles(grade_level);
CREATE INDEX IF NOT EXISTS idx_unlocked_zones_user_id ON unlocked_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard_entries(category, score DESC);
