## Shadowlight

Shadowlight is a Next.js app backed by Supabase with an external n8n workflow that ingests WhatsApp-like webhook events, cleans/enriches content using OpenAI, aggregates recent messages in Redis, and creates or updates tasks via a webhook endpoint.

### Architecture
- **Frontend**: Next.js App Router (`src/app`)
- **APIs**: Next.js API routes (`src/app/api/*`), including `/api/webhook`
- **Database**: Supabase Postgres
- **Automation**: n8n workflow for media handling, LLM enrichment, and task upserts

### Database (Supabase)
Run `supabase-setup.sql` in your Supabase project. It creates `public.tasks` with:
- `id` (UUID), `title` (TEXT), `description` (TEXT), `completed` (BOOLEAN)
- `processed_data` (JSONB), `processed_at` (timestamptz), `status` (TEXT default `pending`)
- `created_at`, `updated_at` timestamps, RLS enabled, helpful indexes

See `SUPABASE_SETUP.md` for step-by-step setup.

### App Webhook API
The n8n workflow calls the app to create or modify tasks.
- **URL**: `/api/webhook`
- **Method**: POST
- **Body**:
```json
{
  "task_id": "optional existing id",
  "title": "enhanced title",
  "description": "enhanced description"
}
```
If `task_id` is provided, the app updates that task; otherwise it creates a new one. Your logic can persist processing results in `processed_data`, set `processed_at`, and update `status`.

### n8n Workflow (overview)
External workflow that:
- Receives events from Evolution webhook (WhatsApp-like) and normalizes fields
- Detects message type (text, audio, image, document)
- For media, fetches base64 from Evolution, converts to binary, then:
  - Transcribes audio with OpenAI
  - Describes images with OpenAI vision
  - Extracts text from PDFs
- Buffers recent messages per chat in Redis under `<chat_id>_buf`, aggregates after 15s inactivity, and cleans text
- Prompts OpenAI (chat) to produce structured task `{ task_id, title, description }`
- POSTs to `/api/webhook` to create/update the task
- Optionally replies to the user via Evolution API with the enhanced title

### Environment Variables
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Credentials for OpenAI, Evolution, and Redis are configured inside n8n.

### Local Development
```bash
npm install
npm run dev
```
Open http://localhost:3000.

### Project Layout
- `src/app/api/*`: API routes, including `/api/webhook`
- `src/lib/*`: app libraries (e.g., `supabase.ts`, `webhook.ts`)
- `supabase-setup.sql`: database schema
- `SUPABASE_SETUP.md`: database setup guide
- `WEBHOOK_API_README.md`: webhook API details
