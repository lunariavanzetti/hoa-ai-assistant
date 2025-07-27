-- HOA AI Assistant Database Schema
-- This schema supports the full HOA management platform with AI automation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'agency')),
    paddle_customer_id TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    usage_stats JSONB DEFAULT '{
        "letters_this_month": 0,
        "complaints_this_month": 0,
        "reports_this_month": 0,
        "meetings_this_month": 0
    }'::jsonb,
    preferences JSONB DEFAULT '{
        "notifications": {
            "email_violations": true,
            "email_complaints": true,
            "email_reports": true
        },
        "ai_settings": {
            "tone": "professional",
            "auto_generate": false
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HOAs table
CREATE TABLE hoas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    total_units INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{
        "auto_generate_letters": false,
        "notification_preferences": ["email"],
        "letterhead_info": {
            "name": "",
            "address": "",
            "phone": "",
            "email": "",
            "logo_url": ""
        },
        "violation_types": [
            "Landscaping/Lawn Care",
            "Parking Violations",
            "Architectural Changes",
            "Noise Complaints",
            "Pet Violations",
            "Trash/Recycling",
            "Other"
        ]
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violations table
CREATE TABLE violations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE NOT NULL,
    resident_name TEXT NOT NULL,
    resident_address TEXT NOT NULL,
    resident_email TEXT,
    resident_phone TEXT,
    violation_type TEXT NOT NULL,
    violation_description TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
    gpt_letter TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'resolved', 'escalated')),
    response_deadline DATE,
    letter_sent_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    previous_violations INTEGER DEFAULT 0,
    fine_amount DECIMAL(10,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE NOT NULL,
    resident_name TEXT NOT NULL,
    resident_email TEXT,
    resident_phone TEXT,
    resident_address TEXT,
    complaint_text TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('maintenance', 'neighbor', 'policy', 'amenity', 'billing', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    gpt_reply TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_resident', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    response_time_hours INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    manager_notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Meeting transcripts table
CREATE TABLE meeting_transcripts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE NOT NULL,
    meeting_type TEXT NOT NULL DEFAULT 'board' CHECK (meeting_type IN ('board', 'annual', 'special', 'committee', 'workshop')),
    meeting_title TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    location TEXT,
    transcript_text TEXT,
    audio_url TEXT,
    video_url TEXT,
    summary TEXT,
    key_decisions TEXT[],
    action_items JSONB DEFAULT '[]'::jsonb, -- Array of {task, assignee, due_date, status}
    attendees JSONB DEFAULT '[]'::jsonb, -- Array of {name, role, present}
    agenda_items TEXT[],
    next_meeting_date DATE,
    recording_duration INTEGER, -- in minutes
    transcription_accuracy DECIMAL(3,2), -- 0.00 to 1.00
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly reports table
CREATE TABLE monthly_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE NOT NULL,
    report_month DATE NOT NULL, -- First day of the month
    report_type TEXT DEFAULT 'monthly' CHECK (report_type IN ('monthly', 'quarterly', 'annual')),
    report_url TEXT, -- PDF storage URL
    summary_text TEXT,
    metrics JSONB DEFAULT '{
        "total_violations": 0,
        "total_complaints": 0,
        "avg_response_time": 0,
        "compliance_rate": 0,
        "satisfaction_score": 0,
        "meetings_held": 0,
        "action_items_completed": 0
    }'::jsonb,
    charts_data JSONB DEFAULT '{}'::jsonb, -- Chart data for visualizations
    ai_insights TEXT[],
    recommendations TEXT[],
    generated_by_ai BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(hoa_id, report_month, report_type)
);

-- Activity logs table (for audit trail and analytics)
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'violation_created', 'complaint_resolved', etc.
    entity_type TEXT NOT NULL, -- 'violation', 'complaint', 'meeting', etc.
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage tracking table
CREATE TABLE ai_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('violation_letter', 'complaint_reply', 'meeting_summary', 'monthly_report', 'data_monitor', 'onboarding')),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription tracking table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    paddle_subscription_id TEXT UNIQUE,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end_date DATE,
    usage_limits JSONB DEFAULT '{
        "max_hoas": 1,
        "max_letters_per_month": 10,
        "max_complaints_per_month": 50,
        "max_meetings_per_month": 5
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (for letter templates, email templates, etc.)
CREATE TABLE templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hoa_id UUID REFERENCES hoas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_type TEXT NOT NULL CHECK (template_type IN ('violation_letter', 'complaint_response', 'meeting_notice', 'general_notice')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names like ["resident_name", "violation_type"]
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Available to all users
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_hoas_owner_id ON hoas(owner_id);
CREATE INDEX idx_violations_hoa_id ON violations(hoa_id);
CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_violations_created_at ON violations(created_at DESC);
CREATE INDEX idx_complaints_hoa_id ON complaints(hoa_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_meeting_transcripts_hoa_id ON meeting_transcripts(hoa_id);
CREATE INDEX idx_meeting_transcripts_date ON meeting_transcripts(meeting_date DESC);
CREATE INDEX idx_monthly_reports_hoa_id ON monthly_reports(hoa_id);
CREATE INDEX idx_monthly_reports_month ON monthly_reports(report_month DESC);
CREATE INDEX idx_activity_logs_hoa_id ON activity_logs(hoa_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at DESC);

-- Create full-text search indexes
CREATE INDEX idx_violations_search ON violations USING gin(to_tsvector('english', violation_description || ' ' || resident_name));
CREATE INDEX idx_complaints_search ON complaints USING gin(to_tsvector('english', complaint_text || ' ' || resident_name));

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- HOAs policies
CREATE POLICY "Users can view own HOAs" ON hoas FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own HOAs" ON hoas FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own HOAs" ON hoas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own HOAs" ON hoas FOR DELETE USING (auth.uid() = owner_id);

-- Violations policies
CREATE POLICY "Users can view violations for their HOAs" ON violations FOR SELECT USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can insert violations for their HOAs" ON violations FOR INSERT WITH CHECK (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can update violations for their HOAs" ON violations FOR UPDATE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can delete violations for their HOAs" ON violations FOR DELETE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);

-- Complaints policies
CREATE POLICY "Users can view complaints for their HOAs" ON complaints FOR SELECT USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can insert complaints for their HOAs" ON complaints FOR INSERT WITH CHECK (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can update complaints for their HOAs" ON complaints FOR UPDATE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can delete complaints for their HOAs" ON complaints FOR DELETE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);

-- Meeting transcripts policies
CREATE POLICY "Users can view meeting transcripts for their HOAs" ON meeting_transcripts FOR SELECT USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can insert meeting transcripts for their HOAs" ON meeting_transcripts FOR INSERT WITH CHECK (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can update meeting transcripts for their HOAs" ON meeting_transcripts FOR UPDATE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can delete meeting transcripts for their HOAs" ON meeting_transcripts FOR DELETE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);

-- Monthly reports policies
CREATE POLICY "Users can view monthly reports for their HOAs" ON monthly_reports FOR SELECT USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can insert monthly reports for their HOAs" ON monthly_reports FOR INSERT WITH CHECK (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can update monthly reports for their HOAs" ON monthly_reports FOR UPDATE USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);

-- Activity logs policies
CREATE POLICY "Users can view activity logs for their HOAs" ON activity_logs FOR SELECT USING (
    hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "System can insert activity logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- AI usage policies
CREATE POLICY "Users can view own AI usage" ON ai_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert AI usage" ON ai_usage FOR INSERT WITH CHECK (true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (user_id = auth.uid());

-- Templates policies
CREATE POLICY "Users can view public templates or own templates" ON templates FOR SELECT USING (
    is_public = true OR user_id = auth.uid() OR hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can insert templates for their HOAs" ON templates FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (hoa_id IS NULL OR hoa_id IN (SELECT id FROM hoas WHERE owner_id = auth.uid()))
);
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE USING (
    user_id = auth.uid()
);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE USING (
    user_id = auth.uid()
);

-- Functions for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hoas_updated_at BEFORE UPDATE ON hoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON violations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_transcripts_updated_at BEFORE UPDATE ON meeting_transcripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_reports_updated_at BEFORE UPDATE ON monthly_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (hoa_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            COALESCE(NEW.hoa_id, NULL),
            auth.uid(),
            TG_TABLE_NAME || '_created',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (hoa_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            COALESCE(NEW.hoa_id, OLD.hoa_id, NULL),
            auth.uid(),
            TG_TABLE_NAME || '_updated',
            TG_TABLE_NAME,
            NEW.id,
            json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (hoa_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            COALESCE(OLD.hoa_id, NULL),
            auth.uid(),
            TG_TABLE_NAME || '_deleted',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

-- Create activity logging triggers
CREATE TRIGGER log_hoas_activity AFTER INSERT OR UPDATE OR DELETE ON hoas FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_violations_activity AFTER INSERT OR UPDATE OR DELETE ON violations FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_complaints_activity AFTER INSERT OR UPDATE OR DELETE ON complaints FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_meeting_transcripts_activity AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to update usage stats
CREATE OR REPLACE FUNCTION update_usage_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_owner_id UUID;
BEGIN
    -- Get the owner of the HOA
    SELECT owner_id INTO user_owner_id FROM hoas WHERE id = NEW.hoa_id;
    
    IF TG_TABLE_NAME = 'violations' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET usage_stats = jsonb_set(
            usage_stats,
            '{letters_this_month}',
            ((usage_stats->>'letters_this_month')::int + 1)::text::jsonb
        )
        WHERE id = user_owner_id;
    ELSIF TG_TABLE_NAME = 'complaints' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET usage_stats = jsonb_set(
            usage_stats,
            '{complaints_this_month}',
            ((usage_stats->>'complaints_this_month')::int + 1)::text::jsonb
        )
        WHERE id = user_owner_id;
    ELSIF TG_TABLE_NAME = 'monthly_reports' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET usage_stats = jsonb_set(
            usage_stats,
            '{reports_this_month}',
            ((usage_stats->>'reports_this_month')::int + 1)::text::jsonb
        )
        WHERE id = user_owner_id;
    ELSIF TG_TABLE_NAME = 'meeting_transcripts' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET usage_stats = jsonb_set(
            usage_stats,
            '{meetings_this_month}',
            ((usage_stats->>'meetings_this_month')::int + 1)::text::jsonb
        )
        WHERE id = user_owner_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create usage tracking triggers
CREATE TRIGGER update_violation_usage AFTER INSERT ON violations FOR EACH ROW EXECUTE FUNCTION update_usage_stats();
CREATE TRIGGER update_complaint_usage AFTER INSERT ON complaints FOR EACH ROW EXECUTE FUNCTION update_usage_stats();
CREATE TRIGGER update_report_usage AFTER INSERT ON monthly_reports FOR EACH ROW EXECUTE FUNCTION update_usage_stats();
CREATE TRIGGER update_meeting_usage AFTER INSERT ON meeting_transcripts FOR EACH ROW EXECUTE FUNCTION update_usage_stats();

-- Insert default templates
INSERT INTO templates (template_type, title, content, variables, is_default, is_public) VALUES
('violation_letter', 'Standard Violation Notice', 
'Dear {{resident_name}},

This letter serves as formal notice that your property at {{property_address}} is in violation of the community guidelines.

Violation Details:
- Type: {{violation_type}}
- Description: {{violation_description}}
- Date Observed: {{violation_date}}

You have {{response_days}} days from the date of this notice to correct the violation. Failure to address this matter may result in additional action including fines or legal proceedings.

If you have any questions or need clarification, please contact us at {{hoa_phone}} or {{hoa_email}}.

Sincerely,
{{manager_name}}
{{hoa_name}}', 
'["resident_name", "property_address", "violation_type", "violation_description", "violation_date", "response_days", "hoa_phone", "hoa_email", "manager_name", "hoa_name"]'::jsonb, 
true, true),

('complaint_response', 'Standard Complaint Response', 
'Dear {{resident_name}},

Thank you for contacting us regarding {{complaint_category}}. We have received your message and appreciate you bringing this matter to our attention.

We will investigate this issue and respond within {{response_timeframe}}. In the meantime, if you have any additional information or questions, please don''t hesitate to reach out.

Best regards,
{{manager_name}}
{{hoa_name}}', 
'["resident_name", "complaint_category", "response_timeframe", "manager_name", "hoa_name"]'::jsonb, 
true, true);

-- Create some views for common queries
CREATE VIEW hoa_dashboard_stats AS
SELECT 
    h.id as hoa_id,
    h.name as hoa_name,
    COUNT(DISTINCT v.id) as total_violations,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'resolved') as resolved_violations,
    COUNT(DISTINCT c.id) as total_complaints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') as resolved_complaints,
    COUNT(DISTINCT mt.id) as total_meetings,
    COUNT(DISTINCT mr.id) as total_reports,
    ROUND(AVG(c.response_time_hours), 2) as avg_response_time_hours
FROM hoas h
LEFT JOIN violations v ON h.id = v.hoa_id
LEFT JOIN complaints c ON h.id = c.hoa_id
LEFT JOIN meeting_transcripts mt ON h.id = mt.hoa_id
LEFT JOIN monthly_reports mr ON h.id = mr.hoa_id
GROUP BY h.id, h.name;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Function to reset monthly usage stats (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage_stats()
RETURNS void AS $$
BEGIN
    UPDATE users SET usage_stats = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    usage_stats,
                    '{letters_this_month}',
                    '0'::jsonb
                ),
                '{complaints_this_month}',
                '0'::jsonb
            ),
            '{reports_this_month}',
            '0'::jsonb
        ),
        '{meetings_this_month}',
        '0'::jsonb
    );
END;
$$ LANGUAGE 'plpgsql';