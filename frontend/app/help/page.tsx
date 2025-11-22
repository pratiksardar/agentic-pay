'use client';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">HumanPay Help</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Why do I see "MiniKit is not installed"?</h2>
            <p className="text-gray-700 mb-2">
              This message appears when you're running the app in a regular browser instead of World App.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-800">
                <strong>Good news:</strong> The app still works! In development mode, you can test all features 
                using mock verification. Just click "Verify with World ID" and it will work.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Use in World App</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Make sure your app is publicly accessible (use ngrok, zrok, or deploy to Vercel)</li>
              <li>Configure the URL in World App Developer Console</li>
              <li>Open the app from within World App</li>
              <li>MiniKit will be automatically available</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Development Mode (Browser)</h2>
            <p className="text-gray-700 mb-2">
              When testing in a browser (localhost), the app uses mock verification:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>✅ All features work normally</li>
              <li>✅ You can verify and access the dashboard</li>
              <li>✅ API calls work (with mock data)</li>
              <li>⚠️ Verification is not real (mock mode)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Troubleshooting</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-800">App won't load:</strong>
                <p className="text-gray-600 text-sm">Check that both frontend (port 3000) and backend (port 5000) are running</p>
              </div>
              <div>
                <strong className="text-gray-800">Verification fails:</strong>
                <p className="text-gray-600 text-sm">In browser: This is normal, use mock verification. In World App: Check your World ID App ID</p>
              </div>
              <div>
                <strong className="text-gray-800">API calls fail:</strong>
                <p className="text-gray-600 text-sm">Make sure backend is running on port 5000</p>
              </div>
            </div>
          </section>

          <div className="pt-4 border-t">
            <a 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

