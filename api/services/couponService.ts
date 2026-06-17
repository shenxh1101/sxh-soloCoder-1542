import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate } from '../utils/format.js';
import { getMemberById } from './memberService.js';
import type { Coupon, CouponCreateRequest } from '../../shared/types/index.js';

export function getCoupons(): Coupon[] {
  return readJSONFile<Coupon[]>('coupons.json');
}

export function getCouponById(id: string): Coupon | undefined {
  const coupons = getCoupons();
  return coupons.find(c => c.id === id);
}

export function getCouponsByMemberId(memberId: string): Coupon[] {
  const coupons = getCoupons();
  return coupons
    .filter(c => c.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnusedCouponsByMemberId(memberId: string): Coupon[] {
  const coupons = getCouponsByMemberId(memberId);
  const now = new Date();
  return coupons.filter(c => {
    if (c.status !== 'unused') return false;
    const validTo = new Date(c.validTo);
    return validTo >= now;
  });
}

export function createCoupon(data: CouponCreateRequest): Coupon | { error: string } {
  const member = getMemberById(data.memberId);
  if (!member) {
    return { error: '会员不存在' };
  }

  const validDays = data.validDays || 30;
  const now = new Date();
  const validFrom = formatDate(now);
  const validToDate = new Date(now);
  validToDate.setDate(validToDate.getDate() + validDays);
  const validTo = formatDate(validToDate);

  const newCoupon: Coupon = {
    id: generateId('cp'),
    memberId: data.memberId,
    name: data.name,
    amount: data.amount,
    type: data.type,
    validFrom,
    validTo,
    status: 'unused',
    usedAt: null,
    usedInRecordId: null,
    createdAt: now.toISOString(),
  };

  const coupons = getCoupons();
  coupons.push(newCoupon);
  writeJSONFile('coupons.json', coupons);

  return newCoupon;
}

export function useCoupon(id: string, recordId: string): Coupon | { error: string } {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === id);
  
  if (index === -1) {
    return { error: '优惠券不存在' };
  }

  const coupon = coupons[index];
  
  if (coupon.status !== 'unused') {
    return { error: '优惠券已使用或已过期' };
  }

  const now = new Date();
  const validTo = new Date(coupon.validTo);
  if (validTo < now) {
    return { error: '优惠券已过期' };
  }

  coupons[index] = {
    ...coupon,
    status: 'used',
    usedAt: now.toISOString(),
    usedInRecordId: recordId,
  };
  
  writeJSONFile('coupons.json', coupons);
  
  return coupons[index];
}

export function expireCoupon(id: string): Coupon | { error: string } {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === id);
  
  if (index === -1) {
    return { error: '优惠券不存在' };
  }

  if (coupons[index].status !== 'unused') {
    return { error: '优惠券状态不是未使用' };
  }

  coupons[index] = {
    ...coupons[index],
    status: 'expired',
  };
  
  writeJSONFile('coupons.json', coupons);
  
  return coupons[index];
}

export function checkAndUpdateExpiredCoupons(): void {
  const coupons = getCoupons();
  const now = new Date();
  let updated = false;

  for (let i = 0; i < coupons.length; i++) {
    if (coupons[i].status === 'unused') {
      const validTo = new Date(coupons[i].validTo);
      if (validTo < now) {
        coupons[i] = {
          ...coupons[i],
          status: 'expired',
        };
        updated = true;
      }
    }
  }

  if (updated) {
    writeJSONFile('coupons.json', coupons);
  }
}
