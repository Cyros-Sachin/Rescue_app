-- Create teams table for dynamic team management
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- NDRF, NCC, FIRE, POLICE, MEDICAL
  contact_number VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  total_personnel INT DEFAULT 0,
  available_personnel INT DEFAULT 0,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create disaster_verification table for AI confidence and manual review
CREATE TABLE IF NOT EXISTS disaster_verification (
  id SERIAL PRIMARY KEY,
  disaster_report_id INT,
  ai_confidence_score DECIMAL(5, 2),
  disaster_type_predicted VARCHAR(100),
  severity_predicted VARCHAR(20),
  verified_by INT,
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  manual_notes TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_report_id) REFERENCES disaster_reports(id) ON DELETE CASCADE
);

-- Add emergency_level to disaster_reports if not exists
ALTER TABLE disaster_reports
ADD COLUMN IF NOT EXISTS emergency_level VARCHAR(20) DEFAULT 'medium', -- high, medium, low
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'; -- pending, verified, rejected

-- Create team_assignments table to track which teams are assigned to which disasters
CREATE TABLE IF NOT EXISTS team_assignments (
  id SERIAL PRIMARY KEY,
  disaster_id INT NOT NULL,
  team_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'assigned', -- assigned, en_route, on_site, completed
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  arrival_time TIMESTAMP,
  completion_time TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disaster_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT,
  disaster_id INT,
  type VARCHAR(50), -- disaster_alert, team_assigned, team_update, verification_needed
  title VARCHAR(100),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disaster_reports(id) ON DELETE CASCADE
);

-- Insert default teams
INSERT INTO teams (name, type, contact_number, email, status, total_personnel, available_personnel)
VALUES
  ('NDRF Unit 1', 'NDRF', '1800-555-0001', 'ndrf1@rescue.gov', 'active', 150, 150),
  ('NCC Battalion', 'NCC', '1800-555-0002', 'ncc@rescue.gov', 'active', 200, 200),
  ('Fire Department', 'FIRE', '1800-555-0003', 'fire@rescue.gov', 'active', 100, 100),
  ('Police Force', 'POLICE', '1800-555-0004', 'police@rescue.gov', 'active', 250, 250),
  ('Medical Emergency', 'MEDICAL', '1800-555-0005', 'medical@rescue.gov', 'active', 80, 80)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_type ON teams(type);
CREATE INDEX IF NOT EXISTS idx_disaster_verification_status ON disaster_verification(verification_status);
CREATE INDEX IF NOT EXISTS idx_team_assignments_disaster ON team_assignments(disaster_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
