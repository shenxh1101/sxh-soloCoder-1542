import { Scissors, Sparkles, Droplets, Wrench } from 'lucide-react';
import type { ServiceItem } from '../../shared/types/index.js';
import { formatCurrency } from '../utils/format.js';

interface ServiceCardProps {
  service: ServiceItem;
  selected: boolean;
  onClick: () => void;
}

const categoryIcons = {
  haircut: Scissors,
  perm: Sparkles,
  treatment: Droplets,
  other: Wrench,
};

const categoryColors = {
  haircut: 'from-blue-400 to-blue-600',
  perm: 'from-purple-400 to-purple-600',
  treatment: 'from-green-400 to-green-600',
  other: 'from-gray-400 to-gray-600',
};

export default function ServiceCard({ service, selected, onClick }: ServiceCardProps) {
  const Icon = categoryIcons[service.category] || Wrench;
  const gradient = categoryColors[service.category] || categoryColors.other;

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        selected
          ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
          : 'border-primary-100 bg-white hover:border-primary-300 hover:shadow-soft'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-primary-800">{service.name}</h4>
          <p className="text-lg font-bold text-primary-700">{formatCurrency(service.price)}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}
