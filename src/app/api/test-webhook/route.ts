import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate n8n webhook data
    const webhookData = {
      title: body.title || 'Test Task from n8n',
      description: body.description || 'This is a test task created via webhook simulation'
    };
    
    console.log('Simulating n8n webhook with data:', webhookData);
    
    // Create task directly in the tasks table (same as the real webhook endpoint)
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: webhookData.title,
        description: webhookData.description,
        completed: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test task:', error);
      return NextResponse.json(
        { error: 'Failed to create test task', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('Test task created successfully:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook executed successfully',
      task: data,
      webhookData: webhookData,
      timestamp: new Date().toISOString()
    });
    
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
