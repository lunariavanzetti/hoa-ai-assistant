-- Create HOA Properties table
CREATE TABLE IF NOT EXISTS hoa_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE hoa_properties ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Policy for users to see only their own HOA properties
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'hoa_properties' 
    AND policyname = 'Users can view their own HOA properties'
  ) THEN
    CREATE POLICY "Users can view their own HOA properties"
      ON hoa_properties FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own HOA properties
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'hoa_properties' 
    AND policyname = 'Users can insert their own HOA properties'
  ) THEN
    CREATE POLICY "Users can insert their own HOA properties"
      ON hoa_properties FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for users to update their own HOA properties
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'hoa_properties' 
    AND policyname = 'Users can update their own HOA properties'
  ) THEN
    CREATE POLICY "Users can update their own HOA properties"
      ON hoa_properties FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for users to delete their own HOA properties
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'hoa_properties' 
    AND policyname = 'Users can delete their own HOA properties'
  ) THEN
    CREATE POLICY "Users can delete their own HOA properties"
      ON hoa_properties FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_hoa_properties_updated_at'
  ) THEN
    CREATE TRIGGER update_hoa_properties_updated_at
      BEFORE UPDATE ON hoa_properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;