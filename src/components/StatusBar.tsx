import React from 'react';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

interface StatusBarProps {
  status: 'idle' | 'running' | 'completed' | 'error';
  message: string;
  lastScrape: string | null;
  nextScrape: string;
}

export default function StatusBar({ status, message, lastScrape, nextScrape }: StatusBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Activity className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-900 border-blue-700';
      case 'completed':
        return 'bg-green-900 border-green-700';
      case 'error':
        return 'bg-red-900 border-red-700';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`border-b ${getStatusColor()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-white">{message}</p>
              {lastScrape && (
                <p className="text-xs text-gray-400">
                  Last scraped: {formatTime(lastScrape)}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-300">Next scrape:</p>
            <p className="text-xs text-gray-400">{formatTime(nextScrape)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}