'use client';

import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-white border-[#198754]',
    error: 'bg-white border-red-500',
    info: 'bg-white border-[#0d6efd]',
  }[type];

  const textColor = {
    success: 'text-[#198754]',
    error: 'text-red-600',
    info: 'text-[#0d6efd]',
  }[type];

  const iconColor = {
    success: 'text-[#198754]',
    error: 'text-red-600',
    info: 'text-[#0d6efd]',
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border rounded-lg shadow-lg p-4 min-w-[280px] max-w-md animate-slide-in retro-card`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {type === 'success' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-semibold ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 ${textColor} hover:opacity-75`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

