import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  trendLabel?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  iconBgColor,
  iconColor,
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={trend.isPositive ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trendLabel && <span className="text-gray-500 text-sm ml-2">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-4 ${iconBgColor} rounded-full`}>
          <div className={`w-8 h-8 ${iconColor}`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
} 