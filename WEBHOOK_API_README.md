# Shadowlight Webhook & API System

This document explains how to use the webhook and API system for the Shadowlight task management application.

## Overview

The system consists of:
1. **Webhook Trigger**: Automatically triggered when a task is created
2. **Webhook Receiver**: Receives processed data from n8n
3. **Data Input API**: Allows external systems to input processed data
4. **Status Tracking**: Monitors webhook and processing status

## API Endpoints

### 1. Webhook Receiver
**URL**: `/api/webhook`  
**Method**: POST  
**Purpose**: Receives processed data from n8n workflow

**Request Body**:
```json
{
  "task_id": "uuid-of-task",
  "processed_data": {
    "analysis_result": "some processed data",
    "confidence_score": 0.95,
    "metadata": {}
  },
  "status": "completed"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Webhook data processed successfully",
  "data": { ... }
}
```

### 2. Data Input API
**URL**: `/api/data`  
**Method**: POST  
**Purpose**: Input processed data for a specific task

**Request Body**:
```json
{
  "task_id": "uuid-of-task",
  "processed_data": {
    "result": "processed information",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task updated with processed data successfully",
  "data": { ... }
}
```

### 3. Test Webhook
**URL**: `/api/test-webhook`  
**Method**: POST  
**Purpose**: Manually test the webhook trigger

**Request Body**:
```json
{
  "title": "Test Task",
  "description": "Test Description"
}
```

### 4. Webhook Status
**URL**: `/api/webhook-status`  
**Method**: GET  
**Purpose**: Check if the n8n webhook is active

## Database Schema

### Tasks Table (Updated)
```sql
ALTER TABLE tasks 
ADD COLUMN processed_data JSONB,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN status TEXT DEFAULT 'pending';
```

### Webhook Data Table
```sql
CREATE TABLE webhook_data (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Workflow

1. **Task Creation**: User creates a task in the UI
2. **Webhook Trigger**: System automatically sends data to n8n webhook
3. **Background Processing**: n8n processes the data
4. **Data Return**: n8n sends processed data back via webhook
5. **Status Update**: Task is updated with processed data and status

## Setup Instructions

### 1. Database Setup
Run the SQL script `webhook-setup.sql` in your Supabase SQL editor.

### 2. Environment Variables
Ensure your `.env.local` file has the necessary Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. n8n Configuration
Configure your n8n workflow to:
- Receive webhook data at `https://n8n-n8n.bhfeyq.easypanel.host/webhook/shadowlight`
- Process the incoming task data
- Send processed data back to your application

## Testing

### Test Webhook Trigger
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Test Description"}'
```

### Test Data Input
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-uuid", "processed_data": {"test": "data"}}'
```

### Check Webhook Status
```bash
curl http://localhost:3000/api/webhook-status
```

## Error Handling

The system includes comprehensive error handling:
- Webhook failures don't break task creation
- All API endpoints return structured error responses
- Failed webhook attempts are logged for debugging
- Database operations include rollback mechanisms

## Security

- Row Level Security (RLS) enabled on webhook data
- Input validation on all API endpoints
- CORS protection for external webhook calls
- Rate limiting considerations for production

## Monitoring

- Webhook status monitoring endpoint
- Task processing status tracking
- Comprehensive logging for debugging
- Performance metrics for webhook calls

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for webhook endpoints
2. **Authentication**: Add API key authentication for external calls
3. **Monitoring**: Set up alerts for webhook failures
4. **Backup**: Implement webhook retry mechanisms
5. **Scaling**: Consider queue-based processing for high volumes
