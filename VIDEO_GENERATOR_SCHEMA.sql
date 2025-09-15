-- AI VIDEO GENERATOR DATABASE SCHEMA MODIFICATIONS
-- Transform HOA AI Assistant into Video Generator Platform

-- Update users table for video generation
ALTER TABLE users ADD COLUMN IF NOT EXISTS video_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS videos_generated_this_month INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;

-- Update usage stats JSON structure
UPDATE users SET usage_stats = jsonb_build_object(
    'videos_this_month', 0,
    'pay_per_video_purchases', 0,
    'total_videos_generated', 0,
    'credits_remaining', CASE
        WHEN subscription_tier = 'free' THEN 2
        WHEN subscription_tier = 'basic' THEN 20
        WHEN subscription_tier = 'premium' THEN -1  -- unlimited
        ELSE 0
    END
);

-- Create video_projects table (replaces violations)
CREATE TABLE IF NOT EXISTS video_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    video_script TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    quality TEXT DEFAULT 'hd' CHECK (quality IN ('hd', '4k')),
    duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    processing_started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_queue table for processing management
CREATE TABLE IF NOT EXISTS video_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    processing_node TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_transactions table for pay-per-video
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('pay_per_video', 'subscription', 'credit_purchase')),
    paddle_transaction_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    credits_added INTEGER DEFAULT 0,
    videos_purchased INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_templates table
CREATE TABLE IF NOT EXISTS video_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    template_config JSONB NOT NULL,
    preview_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update activity logs for video generation
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS video_project_id UUID REFERENCES video_projects(id);

-- Drop HOA-specific tables (optional, for clean transformation)
-- DROP TABLE IF EXISTS violations CASCADE;
-- DROP TABLE IF EXISTS complaints CASCADE;
-- DROP TABLE IF EXISTS meeting_transcripts CASCADE;
-- DROP TABLE IF EXISTS monthly_reports CASCADE;
-- DROP TABLE IF EXISTS hoas CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON video_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_queue_status ON video_queue(status);
CREATE INDEX IF NOT EXISTS idx_video_queue_priority ON video_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);

-- Insert default video templates
INSERT INTO video_templates (name, description, category, template_config, is_premium) VALUES
('Modern Slideshow', 'Clean, professional slideshow template', 'business', '{"style": "modern", "transitions": "fade", "duration": "auto"}', false),
('Dynamic Intro', 'High-energy intro with animations', 'marketing', '{"style": "dynamic", "animations": "scale", "music": "upbeat"}', true),
('Tutorial Format', 'Educational content template', 'education', '{"style": "tutorial", "layout": "split", "captions": true}', false),
('Social Media', 'Optimized for social platforms', 'social', '{"aspect_ratio": "9:16", "style": "mobile", "captions": true}', false);