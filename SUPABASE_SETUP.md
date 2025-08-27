# Supabase Setup for Shadowlight Todo App

## Prerequisites
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A new Supabase project

## Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "shadowlight-todo")
5. Enter a database password (save this!). For local dev, store it in an env var: `SUPABASE_DB_PASSWORD`.
6. Choose a region close to you
7. Click "Create new project"

## Step 2: Get Your Project Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Update Environment Variables
1. In your project root, edit the `.env.local` file
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
N8N_WEBHOOK_URL=https://your-n8n-host/webhook/shadowlight
SUPABASE_DB_PASSWORD=your_strong_password
```

## Step 4: Set Up the Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL

## Step 5: Test the Application
1. Restart your Next.js development server: `npm run dev`
2. Open your browser and go to `http://localhost:3000`
3. Try adding, editing, and deleting tasks
4. Check your Supabase dashboard → **Table Editor** → **tasks** to see the data

## Database Schema
The `tasks` table has the following structure:
- `id`: Unique identifier (UUID)
- `title`: Task title (required)
- `description`: Task description (optional)
- `completed`: Completion status (boolean)
- `processed_data`: JSON payload produced by processing (JSONB)
- `processed_at`: When the task was processed (timestamptz)
- `status`: Processing status, defaults to `pending` (TEXT)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Security Notes
- The current setup allows all operations for demo purposes
- In production, consider implementing proper Row Level Security (RLS) policies
- You may want to add user authentication and restrict access to user-specific tasks

## Troubleshooting
- **"Invalid API key" error**: Double-check your anon key in `.env.local`
- **"Table doesn't exist" error**: Make sure you ran the SQL setup script
- **Connection issues**: Verify your project URL and check if your project is active

## Next Steps
- Add user authentication
- Implement real-time updates with Supabase subscriptions
- Add task categories or tags
- Implement task search and filtering
