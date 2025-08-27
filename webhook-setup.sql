-- Webhook setup for Shadowlight task management system
-- Run this script in your Supabase SQL editor

-- Add new columns to tasks table for webhook processing
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS processed_data JSONB,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create webhook_data table to store incoming webhook data
CREATE TABLE IF NOT EXISTS webhook_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_data_task_id ON webhook_data(task_id);
CREATE INDEX IF NOT EXISTS idx_webhook_data_status ON webhook_data(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create function to update task status when webhook data is processed
CREATE OR REPLACE FUNCTION update_task_webhook_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the task status when webhook data is processed
  IF NEW.status = 'processed' AND OLD.status != 'processed' THEN
    UPDATE tasks 
    SET 
      processed_data = NEW.payload,
      processed_at = NEW.processed_at,
      status = 'processed'
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update task status
DROP TRIGGER IF EXISTS trigger_update_task_webhook_status ON webhook_data;
CREATE TRIGGER trigger_update_task_webhook_status
  AFTER UPDATE ON webhook_data
  FOR EACH ROW
  EXECUTE FUNCTION update_task_webhook_status();

-- Insert sample data for testing (optional)
-- INSERT INTO webhook_data (task_id, payload, status) 
-- VALUES (
--   (SELECT id FROM tasks LIMIT 1),
--   '{"test": "data", "processed": true}',
--   'processed'
-- );

-- Grant necessary permissions
GRANT ALL ON webhook_data TO authenticated;
GRANT ALL ON webhook_data TO anon;

-- Enable Row Level Security (RLS) for webhook_data table
ALTER TABLE webhook_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own webhook data" ON webhook_data
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE id = webhook_data.task_id
    )
  );

CREATE POLICY "Service role can insert webhook data" ON webhook_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update webhook data" ON webhook_data
  FOR UPDATE USING (true);

-- Update existing tasks to have 'pending' status
UPDATE tasks SET status = 'pending' WHERE status IS NULL;
