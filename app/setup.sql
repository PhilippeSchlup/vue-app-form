-- Drop existing table
DROP TABLE IF EXISTS responses;

-- Create new table with descriptive column names
CREATE TABLE responses (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  language TEXT,
  faro_rating SMALLINT,
  faro_flaws TEXT[],
  faro_flaws_other TEXT,
  faro_suggestions TEXT,
  smartphone_os TEXT,
  os_satisfaction SMALLINT,
  duolingo_rating SMALLINT,
  duolingo_flaw TEXT,
  willing_to_pay TEXT,
  faro_residence_duration TEXT,
  business_plan TEXT,
  business_field TEXT,
  app_help_business TEXT,
  most_used_app TEXT,
  most_used_app_reason TEXT,
  subject_to_study TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for the survey)
CREATE POLICY "Allow anonymous inserts" ON responses
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to select (for admin panel)
-- Note: In a production environment, you should use more restrictive policies.
-- For this setup, we assume the admin uses the service role or a specific auth role.
CREATE POLICY "Allow all access to authenticated users" ON responses
  FOR ALL USING (auth.role() = 'authenticated');
