import { getConsumeRecords } from './consumeService.js';
import { getRechargeRecords } from './rechargeService.js';
import { getMembers, getMemberById } from './memberService.js';
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
  LedgerRecord,
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

export function getMemberLedger(memberId: string): LedgerRecord[] {
  checkAndUpdateExpiredCoupons();

  const member = getMemberById(memberId);
  if (!member) return [];

  const memberName = member.name;
  const memberPhone = member.phone;

  const consumes = getConsumeRecords().filter(r => r.memberId === memberId);
  const recharges = getRechargeRecords().filter(r => r.memberId === memberId);
  const coupons = getCoupons().filter(c => c.memberId === memberId && c.status === 'used');

  const records: LedgerRecord[] = [];

  for (const r of consumes) {
    const balanceChange = r.payMethod === 'balance' ? -r.amount : 0;
    const pointsChange = -r.pointsUsed + r.pointsEarned;
    const parts: string[] = [];
    parts.push(`原价${(r.originalAmount / 100).toFixed(2)}元`);
    if (r.couponDiscount > 0) parts.push(`券减${(r.couponDiscount / 100).toFixed(2)}元`);
    if (r.pointsDiscount > 0) parts.push(`积分减${(r.pointsDiscount / 100).toFixed(2)}元`);
    parts.push(`实付${(r.amount / 100).toFixed(2)}元`);
    parts.push(r.payMethod === 'balance' ? '（余额）' : '（现金）');

    records.push({
      id: `l-${r.id}`,
      type: 'consume',
      memberId,
      memberName,
      memberPhone,
      title: r.serviceName,
      description: parts.join('，'),
      amount: r.amount,
      balanceChange,
      pointsChange,
      balanceBefore: r.balanceBefore ?? member.balance,
      balanceAfter: r.balanceAfter ?? member.balance,
      pointsBefore: r.pointsBefore ?? member.points,
      pointsAfter: r.pointsAfter ?? member.points,
      couponName: r.couponName,
      serviceName: r.serviceName,
      payMethod: r.payMethod === 'balance' ? '余额' : '现金',
      rawRecordId: r.id,
      createdAt: r.createdAt,
    });
  }

  for (const r of recharges) {
    records.push({
      id: `l-${r.id}`,
      type: 'recharge',
      memberId,
      memberName,
      memberPhone,
      title: '会员充值',
      description: `充${(r.rechargeAmount / 100).toFixed(2)}元，赠送${(r.bonusAmount / 100).toFixed(2)}元，实到${((r.rechargeAmount + r.bonusAmount) / 100).toFixed(2)}元`,
      amount: r.rechargeAmount + r.bonusAmount,
      balanceChange: r.rechargeAmount + r.bonusAmount,
      pointsChange: 0,
      balanceBefore: r.balanceBefore ?? member.balance,
      balanceAfter: r.balanceAfter ?? member.balance,
      pointsBefore: r.pointsBefore ?? member.points,
      pointsAfter: r.pointsAfter ?? member.points,
      rawRecordId: r.id,
      createdAt: r.createdAt,
    });
  }

  for (const c of coupons) {
    records.push({
      id: `l-c-${c.id}`,
      type: 'coupon_use',
      memberId,
      memberName,
      memberPhone,
      title: '使用优惠券',
      description: `${c.name} - 抵扣${(c.amount / 100).toFixed(2)}元`,
      amount: 0,
      balanceChange: 0,
      pointsChange: 0,
      balanceBefore: member.balance,
      balanceAfter: member.balance,
      pointsBefore: member.points,
      pointsAfter: member.points,
      couponName: c.name,
      rawRecordId: c.id,
      createdAt: c.usedAt || c.createdAt,
    });
  }

  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return records;
}
