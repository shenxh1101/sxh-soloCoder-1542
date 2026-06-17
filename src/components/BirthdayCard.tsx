import { useState } from 'react';
import { Cake, Gift, Ticket, CheckCircle } from 'lucide-react';
import { formatPhone, formatCurrency } from '../utils/format.js';
import { useAppStore } from '../store/index.js';
import Toast from './Toast.js';
import type { Member } from '../../shared/types/index.js';

interface BirthdayCardProps {
  member: Member & { daysUntilBirthday: number };
  couponAmount: number;
  onCouponIssued?: () => void;
}

export default function BirthdayCard({ member, couponAmount, onCouponIssued }: BirthdayCardProps) {
  const { createCoupon, loading } = useAppStore();
  const [isIssued, setIsIssued] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const isToday = member.daysUntilBirthday === 0;

  const handleIssueCoupon = async () => {
    if (isIssued || loading) return;

    const today = new Date();
    const validFrom = today.toISOString().split('T')[0];
    const validTo = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      await createCoupon({
        memberId: member.id,
        name: '生日专属优惠券',
        amount: couponAmount,
        type: 'birthday',
        validFrom,
        validTo,
      });
      setIsIssued(true);
      setToast({ message: `已为 ${member.name} 发放生日优惠券`, type: 'success' });
      setTimeout(() => {
        setIsIssued(false);
        onCouponIssued?.();
      }, 2000);
    } catch (err) {
      console.error('Failed to issue coupon:', err);
    }
  };
  
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
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-primary-500">可用余额</p>
            <p className="font-semibold text-primary-800">{formatCurrency(member.balance)}</p>
          </div>
          {couponAmount > 0 && (
            <button
              onClick={handleIssueCoupon}
              disabled={loading || isIssued}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isIssued
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50'
              }`}
            >
              {isIssued ? (
                <>
                  <CheckCircle size={14} />
                  已发放
                </>
              ) : (
                <>
                  <Ticket size={14} />
                  发优惠券
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
