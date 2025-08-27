// Webhook service for triggering n8n workflow
const N8N_WEBHOOK_URL = 'https://n8n-n8n.bhfeyq.easypanel.host/webhook/shadowlight';

export interface WebhookPayload {
  task_id: string;
  title: string;
  description: string;
  created_at: string;
  action: 'task_created';
  timestamp: string;
}

export async function triggerWebhook(taskData: {
  id: string;
  title: string;
  description: string;
  created_at: string;
}) {
  try {
    const payload: WebhookPayload = {
      task_id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      created_at: taskData.created_at,
      action: 'task_created',
      timestamp: new Date().toISOString()
    };

    console.log('Triggering webhook with payload:', payload);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Webhook triggered successfully:', result);
    
    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error triggering webhook:', error);
    
    // Return error but don't throw - we don't want webhook failures to break task creation
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to check webhook status
export async function checkWebhookStatus() {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Webhook check failed with status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      status: 'active',
      data: result
    };

  } catch (error) {
    console.error('Error checking webhook status:', error);
    return {
      success: false,
      status: 'inactive',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
