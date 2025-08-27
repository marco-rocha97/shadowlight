import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate n8n webhook data
    const webhookData = {
      title: body.title || 'Test Task from n8n',
      description: body.description || 'This is a test task created via webhook simulation',
      task_id: body.task_id || null, // Allow testing with specific task_id
      completed: body.completed !== undefined ? body.completed : false
    };
    
    console.log('Simulating n8n webhook with data:', webhookData);
    
    let result;
    let operation;
    
    // Check if we have a task_id to update an existing task
    if (webhookData.task_id) {
      console.log('Attempting to update existing task:', webhookData.task_id);
      
      // First, check if the task exists
      const { data: existingTask, error: checkError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', webhookData.task_id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing task:', checkError);
        return NextResponse.json(
          { error: 'Failed to check existing task', details: checkError.message },
          { status: 500 }
        );
      }
      
      if (existingTask) {
        // Task exists, update it
        console.log('Updating existing task:', existingTask.id);
        
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: webhookData.title,
            description: webhookData.description,
            completed: webhookData.completed
          })
          .eq('id', webhookData.task_id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating test task:', error);
          return NextResponse.json(
            { error: 'Failed to update test task', details: error.message },
            { status: 500 }
          );
        }
        
        result = data;
        operation = 'updated';
        console.log('Test task updated successfully:', data);
      } else {
        // Task doesn't exist, create new one with the provided ID
        console.log('Task ID provided but not found, creating new test task with specified ID');
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            id: webhookData.task_id,
            title: webhookData.title,
            description: webhookData.description,
            completed: webhookData.completed
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating test task with specified ID:', error);
          return NextResponse.json(
            { error: 'Failed to create test task with specified ID', details: error.message },
            { status: 500 }
          );
        }
        
        result = data;
        operation = 'created';
        console.log('Test task created successfully with specified ID:', data);
      }
    } else {
      // No task_id provided, create new task
      console.log('Creating new test task:', webhookData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: webhookData.title,
          description: webhookData.description,
          completed: webhookData.completed
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
      
      result = data;
      operation = 'created';
      console.log('Test task created successfully:', data);
    }
    
    return NextResponse.json({
      success: true,
      message: `Test webhook executed successfully - Task ${operation}`,
      task: result,
      webhookData: webhookData,
      operation: operation,
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
    usage: 'POST with { "title": "Test Task", "description": "Test Description", "task_id": "optional-uuid", "completed": false }',
    examples: [
      'Create new task: { "title": "New Task", "description": "New Description" }',
      'Update existing task: { "title": "Updated Task", "description": "Updated Description", "task_id": "existing-uuid" }',
      'Create with specific ID: { "title": "Specific Task", "description": "Specific Description", "task_id": "new-uuid" }'
    ],
    timestamp: new Date().toISOString()
  });
}
