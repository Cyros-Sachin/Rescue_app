-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disaster reports table
CREATE TABLE IF NOT EXISTS disaster_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  ai_analysis TEXT,
  assigned_team TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'dispatched', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  team_type TEXT NOT NULL CHECK (team_type IN ('NCC', 'NDRF', 'Fire', 'Police', 'Medical', 'Other')),
  phone TEXT NOT NULL,
  email TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Disaster reports policies
CREATE POLICY "Users can view their own reports" ON disaster_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" ON disaster_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON disaster_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Emergency contacts policies (public read access)
CREATE POLICY "Anyone can view emergency contacts" ON emergency_contacts
  FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_disaster_reports_user_id ON disaster_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_status ON disaster_reports(status);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_team_type ON emergency_contacts(team_type);

-- Insert default emergency contacts
INSERT INTO emergency_contacts (team_name, team_type, phone, email, description) VALUES
  ('National Disaster Response Force', 'NDRF', '011-24363260', 'ndrf@nic.in', 'Specialized force for disaster response including floods, earthquakes, and building collapses'),
  ('National Cadet Corps', 'NCC', '011-23010231', 'ncc@nic.in', 'Youth organization for disaster relief and community service'),
  ('Fire Department', 'Fire', '101', 'fire@emergency.in', 'Fire and rescue services'),
  ('Police Emergency', 'Police', '100', 'police@emergency.in', 'Law enforcement and emergency response'),
  ('Medical Emergency', 'Medical', '108', 'ambulance@emergency.in', 'Medical emergency and ambulance services');
