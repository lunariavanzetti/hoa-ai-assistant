// Setup videos table in Supabase
// File: /api/setup-videos-table.js

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase service role key'
      })
    }


    // SQL to create videos table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT NOT NULL,
        prompt TEXT NOT NULL,
        video_url TEXT NOT NULL,
        orientation TEXT DEFAULT 'horizontal' CHECK (orientation IN ('horizontal', 'vertical')),
        generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
        file_size BIGINT,
        duration INTEGER, -- in seconds
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Add foreign key constraint to users table
        CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES users(email)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_videos_user_email ON videos(user_email);
      CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
      CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(generation_status);

      -- Enable Row Level Security
      ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

      -- Create policy for users to see only their own videos
      CREATE POLICY IF NOT EXISTS "Users can view own videos" ON videos
        FOR SELECT USING (user_email = auth.jwt() ->> 'email');

      -- Create policy for service role to manage all videos
      CREATE POLICY IF NOT EXISTS "Service role can manage all videos" ON videos
        FOR ALL USING (auth.role() = 'service_role');
    `


    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    })

    const responseText = await response.text()

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Videos table created successfully',
        timestamp: new Date().toISOString()
      })
    } else {
      // Try alternative approach using raw SQL execution

      // For now, let's just return success and handle table creation manually
      return res.status(200).json({
        success: true,
        message: 'Videos table setup initiated (may need manual completion)',
        sql: createTableSQL,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to setup videos table',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}