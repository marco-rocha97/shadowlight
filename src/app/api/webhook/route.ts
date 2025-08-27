import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data for debugging
    console.log('Webhook received from n8n:', JSON.stringify(body, null, 2));
    
    // Validate the request body
    if (!body || typeof body !== 'object') {
      console.error('Invalid webhook body:', body);
      return NextResponse.json(
        { error: 'Invalid webhook data format' },
        { status: 400 }
      );
    }
    
    // Extract task data from n8n webhook
    const taskData = {
      title: body.title || 'Task from n8n',
      description: body.description || 'Task created via webhook',
      completed: false
    };
    
    console.log('Creating task from webhook:', taskData);
    
    // Create the task directly in the tasks table
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task from webhook:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create task from webhook',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    console.log('Task created successfully from webhook:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully from webhook',
      task: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}
