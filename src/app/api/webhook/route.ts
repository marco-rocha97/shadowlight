import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data for debugging
    console.log('Webhook received:', body);
    
    // Process the webhook data here
    // This is where you would handle the data from n8n
    const processedData = {
      ...body,
      processed_at: new Date().toISOString(),
      status: 'processed'
    };
    
    // Store the processed data in a new table (you'll need to create this)
    const { data, error } = await supabase
      .from('webhook_data')
      .insert([processedData])
      .select()
      .single();
    
    if (error) {
      console.error('Error storing webhook data:', error);
      return NextResponse.json(
        { error: 'Failed to store webhook data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook data processed successfully',
      data: data
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
