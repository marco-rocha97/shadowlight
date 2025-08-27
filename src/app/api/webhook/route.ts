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
      completed: body.completed !== undefined ? body.completed : false
    };
    
    let result;
    let operation;
    
    // Check if we have a task_id to update an existing task
    if (body.task_id) {
      console.log('Attempting to update existing task:', body.task_id);
      
      // First, check if the task exists
      const { data: existingTask, error: checkError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', body.task_id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing task:', checkError);
        return NextResponse.json(
          { 
            error: 'Failed to check existing task',
            details: checkError.message,
            code: checkError.code
          },
          { status: 500 }
        );
      }
      
      if (existingTask) {
        // Task exists, update it
        console.log('Updating existing task:', existingTask.id);
        
        const { data, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', body.task_id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating task from webhook:', error);
          return NextResponse.json(
            { 
              error: 'Failed to update task from webhook',
              details: error.message,
              code: error.code
            },
            { status: 500 }
          );
        }
        
        result = data;
        operation = 'updated';
        console.log('Task updated successfully from webhook:', data);
      } else {
        // Task doesn't exist, create new one with the provided ID
        console.log('Task ID provided but not found, creating new task with specified ID');
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ id: body.task_id, ...taskData }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating task with specified ID from webhook:', error);
          return NextResponse.json(
            { 
              error: 'Failed to create task with specified ID from webhook',
              details: error.message,
              code: error.code
            },
            { status: 500 }
          );
        }
        
        result = data;
        operation = 'created';
        console.log('Task created successfully with specified ID from webhook:', data);
      }
    } else {
      // No task_id provided, create new task
      console.log('Creating new task from webhook:', taskData);
      
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
      
      result = data;
      operation = 'created';
      console.log('Task created successfully from webhook:', data);
    }
    
    return NextResponse.json({
      success: true,
      message: `Task ${operation} successfully from webhook`,
      task: result,
      operation: operation,
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
