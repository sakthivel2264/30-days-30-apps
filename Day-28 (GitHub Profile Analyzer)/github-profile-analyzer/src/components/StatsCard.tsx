import React from 'react';
import { formatNumber } from '../utils/helpers';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1`}>{formatNumber(value)}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${color.replace('text-', 'bg-').replace('600', '100')} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
