import { NextResponse } from 'next/server';
import { checkWebhookStatus } from '@/lib/webhook';

export async function GET() {
  try {
    const status = await checkWebhookStatus();
    
    return NextResponse.json({
      success: true,
      webhook_status: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook status check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check webhook status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
