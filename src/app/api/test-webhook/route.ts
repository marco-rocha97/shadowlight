import { NextRequest, NextResponse } from 'next/server';
import { triggerWebhook } from '@/lib/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate test data
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: title and description' },
        { status: 400 }
      );
    }
    
    // Create test task data
    const testTaskData = {
      id: 'test-' + Date.now(),
      title: body.title,
      description: body.description,
      created_at: new Date().toISOString()
    };
    
    // Trigger the webhook
    const result = await triggerWebhook(testTaskData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test webhook triggered successfully',
        webhook_result: result.data,
        test_data: testTaskData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test webhook failed',
        error: result.error,
        test_data: testTaskData
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint',
    usage: 'POST with { "title": "Test Task", "description": "Test Description" }',
    timestamp: new Date().toISOString()
  });
}
