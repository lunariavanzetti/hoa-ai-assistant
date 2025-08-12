-- Add missing subscription columns to users table
-- Run this in your Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_paddle_subscription_id ON users(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update your specific user to Pro immediately
UPDATE users 
SET 
    subscription_tier = 'pro',
    subscription_status = 'active',
    paddle_subscription_id = 'txn_01k2f46pafhsn39gv547kxc2dr',
    updated_at = NOW()
WHERE email = 'v1ktor1ach124@gmail.com';

-- Verify the update
SELECT email, subscription_tier, subscription_status, paddle_subscription_id 
FROM users 
WHERE email = 'v1ktor1ach124@gmail.com';