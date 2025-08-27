-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you might want to restrict this based on user authentication
DROP POLICY IF EXISTS "Allow all operations for tasks" ON public.tasks;
CREATE POLICY "Allow all operations for tasks" ON public.tasks
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional) - only if table is empty
INSERT INTO public.tasks (title, description) 
SELECT 'Welcome to Shadowlight', 'This is your first task! Click the checkbox to mark it as complete.'
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Welcome to Shadowlight');

INSERT INTO public.tasks (title, description) 
SELECT 'Explore the app', 'Try adding, editing, and deleting tasks to see how everything works.'
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Explore the app');
