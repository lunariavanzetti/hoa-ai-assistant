-- Manual token update for user temakikitemakiki@gmail.com
-- Run this in your Supabase SQL Editor

UPDATE users
SET
  tokens = 4,
  subscription_tier = 'pay_per_video',
  subscription_status = 'active',
  updated_at = NOW()
WHERE email = 'temakikitemakiki@gmail.com';

-- Verify the update
SELECT
  email,
  tokens,
  subscription_tier,
  subscription_status,
  updated_at
FROM users
WHERE email = 'temakikitemakiki@gmail.com';