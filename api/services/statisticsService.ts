import { getConsumeRecords } from './consumeService.js';
import { getRechargeRecords } from './rechargeService.js';
import { getMembers } from './memberService.js';
import { getCoupons, checkAndUpdateExpiredCoupons } from './couponService.js';
import { isSameDay, isSameWeek, isSameMonth, formatMonth } from '../utils/format.js';
import type {
  StatisticsData,
  ConsumeRecord,
  RechargeRecord,
  Coupon,
  MarketingStatistics,
  MonthlyStatement,
  Member,
} from '../../shared/types/index.js';

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

function filterSameMonth<T>(records: T[], getDate: (r: T) => string, targetDate: Date): T[] {
  return records.filter(r => isSameMonth(new Date(getDate(r)), targetDate));
}

function calculateMarketingStats(
  coupons: Coupon[],
  consumeRecords: ConsumeRecord[],
  targetDate: Date = new Date()
): MarketingStatistics {
  const monthCouponsIssued = filterSameMonth(coupons, c => c.createdAt, targetDate);
  const couponsIssued = monthCouponsIssued.length;
  const couponsExpired = monthCouponsIssued.filter(c => c.status === 'expired').length;

  const monthCouponsUsed = coupons.filter(c =>
    c.status === 'used' && c.usedAt && isSameMonth(new Date(c.usedAt), targetDate)
  );
  const couponsUsed = monthCouponsUsed.length;
  const couponDiscountAmount = monthCouponsUsed.reduce((sum, c) => sum + c.amount, 0);

  const monthConsumes = filterSameMonth(consumeRecords, r => r.createdAt, targetDate);
  const pointsDiscountAmount = monthConsumes.reduce((sum, r) => sum + (r.pointsDiscount || 0), 0);

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
  const allConsumeRecords = getConsumeRecords();

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

  const marketing = calculateMarketingStats(coupons, allConsumeRecords);

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

export function getMonthlyStatement(year: number, month: number): MonthlyStatement {
  checkAndUpdateExpiredCoupons();

  const targetDate = new Date(year, month - 1, 15);
  const monthStr = formatMonth(targetDate);

  const allConsumes = getConsumeRecords();
  const allRecharges = getRechargeRecords();
  const allMembers = getMembers();
  const allCoupons = getCoupons();

  const monthConsumes = filterSameMonth(allConsumes, r => r.createdAt, targetDate);
  const monthRecharges = filterSameMonth(allRecharges, r => r.createdAt, targetDate);
  const monthNewMembers = filterSameMonth(allMembers, m => m.createdAt, targetDate);

  const cashIncome = monthConsumes
    .filter(r => r.payMethod === 'cash')
    .reduce((sum, r) => sum + r.amount, 0);

  const rechargeIncome = monthRecharges.reduce((sum, r) => sum + r.rechargeAmount, 0);
  const bonusAmount = monthRecharges.reduce((sum, r) => sum + r.bonusAmount, 0);

  const balanceDeduction = monthConsumes
    .filter(r => r.payMethod === 'balance')
    .reduce((sum, r) => sum + r.amount, 0);

  const couponDiscountAmount = monthConsumes.reduce((sum, r) => sum + (r.couponDiscount || 0), 0);
  const pointsDiscountAmount = monthConsumes.reduce((sum, r) => sum + (r.pointsDiscount || 0), 0);
  const totalDiscountAmount = couponDiscountAmount + pointsDiscountAmount;

  const originalConsumeAmount = monthConsumes.reduce((sum, r) => sum + (r.originalAmount || r.amount), 0);
  const totalConsumeAmount = monthConsumes.reduce((sum, r) => sum + r.amount, 0);

  const totalIncome = cashIncome + rechargeIncome;

  const marketing = calculateMarketingStats(allCoupons, allConsumes, targetDate);

  return {
    month: monthStr,
    totalIncome,
    cashIncome,
    rechargeIncome,
    bonusAmount,
    balanceDeduction,
    couponDiscountAmount,
    pointsDiscountAmount,
    totalDiscountAmount,
    consumeCount: monthConsumes.length,
    newMemberCount: monthNewMembers.length,
    totalConsumeAmount,
    originalConsumeAmount,
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
