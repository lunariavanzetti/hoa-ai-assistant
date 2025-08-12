import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    console.log('Testing Supabase connection...')
    
    // Check environment variables
    const hasUrl = !!process.env.SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Has URL:', hasUrl)
    console.log('Has Key:', hasKey)
    
    if (!hasUrl || !hasKey) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        hasUrl,
        hasKey
      })
    }
    
    // Try to create client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('Supabase client created successfully')
    
    // Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
    
    if (error) {
      console.log('Supabase query error:', error)
      return res.status(500).json({ 
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      })
    }
    
    console.log('Supabase query successful')
    
    res.status(200).json({ 
      success: true,
      message: 'Supabase connection working',
      profileCount: data?.length || 0
    })
    
  } catch (error) {
    console.error('Connection test error:', error)
    res.status(500).json({ 
      error: 'Connection test failed',
      details: error.message,
      type: error.constructor.name
    })
  }
}