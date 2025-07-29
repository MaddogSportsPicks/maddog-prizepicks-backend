import React from 'react';
import { type Icon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: Icon;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-900 border-green-700 text-green-400';
      case 'blue':
        return 'bg-blue-900 border-blue-700 text-blue-400';
      case 'purple':
        return 'bg-purple-900 border-purple-700 text-purple-400';
      case 'orange':
        return 'bg-orange-900 border-orange-700 text-orange-400';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-400';
    }
  };

  return (
    <div className={`border rounded-lg p-6 ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8" />
      </div>
    </div>
  );
}