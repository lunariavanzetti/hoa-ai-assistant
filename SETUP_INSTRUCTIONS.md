# 🚀 Setup Instructions

## Database Setup

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `SUPABASE_SCHEMA.sql`**
4. **Run the query** - this will create all tables, RLS policies, and functions

## Authentication Setup

1. **Go to Authentication → Settings in Supabase**
2. **Enable Google Provider:**
   - Go to Auth → Providers
   - Enable Google
   - Add your Google OAuth credentials
   - Set redirect URL to: `http://localhost:5173/auth/callback`

3. **Enable Email Provider:**
   - Should be enabled by default
   - Configure email templates if needed

## Environment Variables

Update your `.env` file with:
- Your Supabase anon key (from Settings → API)
- Your OpenAI API key
- Your Paddle credentials (when ready)

## Google OAuth Setup

1. **Go to Google Cloud Console**
2. **Create a new project** (or use existing)
3. **Enable Google+ API**
4. **Create OAuth 2.0 credentials**
5. **Add authorized redirect URIs:**
   - `https://ziwwwlahrsvrafyawkjw.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback`
6. **Copy Client ID and Secret to Supabase**