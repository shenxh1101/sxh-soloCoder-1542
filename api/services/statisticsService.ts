import { getConsumeRecords } from './consumeService.js';
import { getRechargeRecords } from './rechargeService.js';
import { getMembers } from './memberService.js';
import { getCoupons, checkAndUpdateExpiredCoupons } from './couponService.js';
import { isSameDay, isSameWeek, isSameMonth } from '../utils/format.js';
import type { StatisticsData, ConsumeRecord, RechargeRecord, Coupon, MarketingStatistics } from '../../shared/types/index.js';

type DateFilter = 'daily' | 'weekly' | 'monthly';

function filterByDate<T extends { createdAt: string }>(
  records: T[],
  filter: DateFilter,
  now: Date = new Date()
): T[] {
  return records.filter(r => {
    const recordDate = new Date(r.createdAt);
    switch (filter) {
      case 'daily':
        return isSameDay(recordDate, now);
      case 'weekly':
        return isSameWeek(recordDate, now);
      case 'monthly':
        return isSameMonth(recordDate, now);
      default:
        return true;
    }
  });
}

function calculateMarketingStats(
  coupons: Coupon[],
  filter: DateFilter
): MarketingStatistics {
  const filteredCoupons = filterByDate(coupons, filter);
  
  const couponsIssued = filteredCoupons.length;
  const couponsUsed = filteredCoupons.filter(c => c.status === 'used').length;
  const couponsExpired = filteredCoupons.filter(c => c.status === 'expired').length;
  
  const couponDiscountAmount = filteredCoupons
    .filter(c => c.status === 'used')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const pointsDiscountAmount = 0;
  
  return {
    couponsIssued,
    couponsUsed,
    couponsExpired,
    couponDiscountAmount,
    pointsDiscountAmount,
    totalDiscountAmount: couponDiscountAmount + pointsDiscountAmount,
  };
}

export function getStatistics(filter: DateFilter): StatisticsData {
  checkAndUpdateExpiredCoupons();
  
  const consumeRecords = filterByDate(getConsumeRecords(), filter);
  const rechargeRecords = filterByDate(getRechargeRecords(), filter);
  const coupons = getCoupons();
  
  const cashIncome = consumeRecords
    .filter(r => r.payMethod === 'cash')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const rechargeIncome = rechargeRecords
    .reduce((sum, r) => sum + r.rechargeAmount, 0);
  
  const totalIncome = cashIncome + rechargeIncome;
  
  const consumeCount = consumeRecords.length;
  const memberCount = getMembers().length;
  
  const allRecords = [...consumeRecords, ...rechargeRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const marketing = calculateMarketingStats(coupons, filter);

  return {
    cashIncome,
    rechargeIncome,
    totalIncome,
    consumeCount,
    memberCount,
    records: allRecords as (ConsumeRecord | RechargeRecord)[],
    marketing,
  };
}

export function getDailyTrend(days: number = 7): { date: string; cash: number; recharge: number }[] {
  const result: { date: string; cash: number; recharge: number }[] = [];
  const consumeRecords = getConsumeRecords();
  const rechargeRecords = getRechargeRecords();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const dayConsume = consumeRecords.filter(r => isSameDay(new Date(r.createdAt), date));
    const dayRecharge = rechargeRecords.filter(r => isSameDay(new Date(r.createdAt), date));
    
    const cash = dayConsume
      .filter(r => r.payMethod === 'cash')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const recharge = dayRecharge.reduce((sum, r) => sum + r.rechargeAmount, 0);
    
    result.push({ date: dateStr, cash, recharge });
  }
  
  return result;
}
