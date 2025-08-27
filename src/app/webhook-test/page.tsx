'use client';

import { useState } from 'react';

export default function WebhookTestPage() {
  const [testTitle, setTestTitle] = useState('Test Task');
  const [testDescription, setTestDescription] = useState('Test Description');
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: testTitle,
          description: testDescription,
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Failed to test webhook' });
    } finally {
      setLoading(false);
    }
  };

  const checkWebhookStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/webhook-status');
      const result = await response.json();
      setWebhookStatus(result);
    } catch (error) {
      setWebhookStatus({ error: 'Failed to check webhook status' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Webhook Testing
          </h1>
          <p className="text-gray-600 text-lg">
            Test and monitor webhook functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Webhook Test Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Test Webhook Trigger
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Test task title"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Test task description"
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={testWebhook}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? 'Testing...' : 'Test Webhook'}
              </button>
            </div>

            {testResult && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Webhook Status Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Webhook Status
            </h2>
            <div className="space-y-4">
              <button
                onClick={checkWebhookStatus}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </div>

            {webhookStatus && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Status:</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(webhookStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            API Endpoints
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>POST /api/test-webhook</strong> - Test webhook trigger
            </div>
            <div>
              <strong>GET /api/webhook-status</strong> - Check webhook status
            </div>
            <div>
              <strong>POST /api/webhook</strong> - Receive webhook data from n8n
            </div>
            <div>
              <strong>POST /api/data</strong> - Input processed data
            </div>
          </div>
        </div>

        {/* Back to Main App */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Task Manager
          </a>
        </div>
      </div>
    </div>
  );
}
