import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  change,
  changeType,
}: StatCardProps) {
  return (
    <div className={`stat-card bg-gradient-to-br ${gradient}`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon size={24} className="text-white" />
          </div>
          {change && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                changeType === 'increase'
                  ? 'bg-green-400/30 text-green-100'
                  : 'bg-red-400/30 text-red-100'
              }`}
            >
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </span>
          )}
        </div>
        <p className="text-white/80 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
    </div>
  );
}
