-- User Activities Table for Usage Tracking
-- This tracks all AI-generated content for analytics and history

CREATE TABLE user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'violation_letter', 'complaint_response', 'meeting_minutes', 'monthly_report'
  title VARCHAR(255) NOT NULL, -- Brief description of what was generated
  content TEXT, -- The actual generated content (for history viewing)
  metadata JSONB, -- Additional data like resident name, violation type, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_user_activities_user_type ON user_activities(user_id, activity_type);

-- Row Level Security (RLS)
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activities
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own activities  
CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own activities
CREATE POLICY "Users can update own activities" ON user_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own activities
CREATE POLICY "Users can delete own activities" ON user_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_activities TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;