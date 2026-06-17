import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate, calculatePoints } from '../utils/format.js';
import { getMemberById, updateMember } from './memberService.js';
import { useCoupon, getCouponById } from './couponService.js';
import type { ConsumeRecord, ConsumeRequest, PointsRules, Coupon } from '../../shared/types/index.js';

export interface ConsumeResult {
  record: ConsumeRecord;
  couponUsed?: Coupon;
  pointsUsed: number;
  pointsDiscount: number;
  actualAmount: number;
}

export function getConsumeRecords(): ConsumeRecord[] {
  return readJSONFile<ConsumeRecord[]>('consumeRecords.json');
}

export function getConsumeRecordsByMemberId(memberId: string): ConsumeRecord[] {
  const records = getConsumeRecords();
  return records.filter(r => r.memberId === memberId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createConsume(
  data: ConsumeRequest,
  pointsRules: PointsRules
): ConsumeResult | { error: string } {
  const member = getMemberById(data.memberId);
  if (!member) {
    return { error: '会员不存在' };
  }

  let couponDiscount = 0;
  let usedCoupon: Coupon | undefined;

  if (data.couponId) {
    const coupon = getCouponById(data.couponId);
    if (!coupon) {
      return { error: '优惠券不存在' };
    }
    if (coupon.memberId !== data.memberId) {
      return { error: '优惠券不属于该会员' };
    }
    if (coupon.status !== 'unused') {
      return { error: '优惠券已使用或已过期' };
    }
    const now = new Date();
    const validTo = new Date(coupon.validTo);
    if (validTo < now) {
      return { error: '优惠券已过期' };
    }
    couponDiscount = coupon.amount;
  }

  let pointsDiscount = 0;
  let pointsUsed = 0;
  if (data.pointsUsed && data.pointsUsed > 0) {
    if (data.pointsUsed > member.points) {
      return { error: '积分不足' };
    }
    if (data.pointsUsed < pointsRules.minPoints) {
      return { error: `最低使用 ${pointsRules.minPoints} 积分` };
    }
    pointsDiscount = Math.floor(data.pointsUsed / pointsRules.exchangeRate) * 100;
    pointsUsed = data.pointsUsed;
  }

  const totalDiscount = couponDiscount + pointsDiscount;
  const actualAmount = Math.max(0, data.amount - totalDiscount);

  if (data.payMethod === 'balance' && member.balance < actualAmount) {
    return { error: '余额不足' };
  }

  const pointsEarned = calculatePoints(actualAmount, pointsRules.pointsPerYuan);

  const newRecord: ConsumeRecord = {
    id: generateId('c'),
    memberId: data.memberId,
    serviceName: data.serviceName,
    amount: actualAmount,
    originalAmount: data.amount,
    couponDiscount,
    couponId: data.couponId || null,
    pointsUsed,
    pointsDiscount,
    payMethod: data.payMethod,
    pointsEarned,
    createdAt: new Date().toISOString(),
  };

  const records = getConsumeRecords();
  records.push(newRecord);
  writeJSONFile('consumeRecords.json', records);

  if (data.couponId) {
    const couponResult = useCoupon(data.couponId, newRecord.id);
    if ('error' in couponResult) {
      return { error: couponResult.error };
    }
    usedCoupon = couponResult;
  }

  const newBalance = data.payMethod === 'balance' ? member.balance - actualAmount : member.balance;
  const newPoints = member.points - pointsUsed + pointsEarned;
  
  updateMember(member.id, {
    balance: newBalance,
    points: newPoints,
    lastVisitAt: newRecord.createdAt,
  });

  return {
    record: newRecord,
    couponUsed: usedCoupon,
    pointsUsed,
    pointsDiscount,
    actualAmount,
  };
}
