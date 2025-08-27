import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input data
    if (!body.task_id || !body.processed_data) {
      return NextResponse.json(
        { error: 'Missing required fields: task_id and processed_data' },
        { status: 400 }
      );
    }
    
    // Update the task with processed data
    const { data, error } = await supabase
      .from('tasks')
      .update({
        processed_data: body.processed_data,
        processed_at: new Date().toISOString(),
        status: 'processed'
      })
      .eq('id', body.task_id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task with processed data:', error);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task updated with processed data successfully',
      data: data
    });
    
  } catch (error) {
    console.error('Data input error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'task_id parameter is required' },
        { status: 400 }
      );
    }
    
    // Get the task with processed data
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) {
      console.error('Error fetching task:', error);
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
