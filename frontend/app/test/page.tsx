'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4">HumanPay Test Page</h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the app is working!
        </p>
        <div className="space-y-2">
          <div>
            <strong>Frontend:</strong> ✅ Running
          </div>
          <div>
            <strong>Backend API:</strong>{' '}
            <a 
              href="http://localhost:5001/health" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Test Backend
            </a>
          </div>
          <div>
            <strong>Main App:</strong>{' '}
            <a 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

