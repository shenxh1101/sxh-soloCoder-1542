import { Cake, Gift } from 'lucide-react';
import { formatPhone, formatCurrency } from '../utils/format.js';
import type { Member } from '../../shared/types/index.js';

interface BirthdayCardProps {
  member: Member & { daysUntilBirthday: number };
  couponAmount: number;
}

export default function BirthdayCard({ member, couponAmount }: BirthdayCardProps) {
  const isToday = member.daysUntilBirthday === 0;
  
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
      isToday
        ? 'bg-gradient-to-r from-pink-50 to-accent-50 border-pink-300'
        : 'bg-white border-primary-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isToday
            ? 'bg-gradient-to-br from-pink-400 to-pink-600 animate-pulse'
            : 'bg-gradient-to-br from-accent-400 to-accent-600'
        }`}>
          <Cake size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-primary-800">{member.name}</h4>
            {isToday && (
              <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                今天生日
              </span>
            )}
          </div>
          <p className="text-sm text-primary-600 mb-1">{formatPhone(member.phone)}</p>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${
              isToday ? 'text-pink-600' : 'text-accent-600'
            }`}>
              {isToday ? '今天生日！' : `${member.daysUntilBirthday} 天后生日`}
            </span>
            {couponAmount > 0 && (
              <span className="flex items-center gap-1 text-xs text-primary-500">
                <Gift size={12} />
                可发送 {formatCurrency(couponAmount)} 优惠券
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary-500">可用余额</p>
          <p className="font-semibold text-primary-800">{formatCurrency(member.balance)}</p>
        </div>
      </div>
    </div>
  );
}
