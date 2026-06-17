export interface Member {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  balance: number;
  points: number;
  createdAt: string;
  lastVisitAt: string | null;
}

export interface ConsumeRecord {
  id: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  serviceName: string;
  amount: number;
  originalAmount: number;
  couponDiscount: number;
  couponId: string | null;
  couponName?: string;
  pointsUsed: number;
  pointsDiscount: number;
  payMethod: 'balance' | 'cash';
  pointsEarned: number;
  balanceBefore: number;
  balanceAfter: number;
  pointsBefore: number;
  pointsAfter: number;
  createdAt: string;
}

export interface RechargeRecord {
  id: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  rechargeAmount: number;
  bonusAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  pointsBefore: number;
  pointsAfter: number;
  createdAt: string;
}

export interface PointsExchange {
  id: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  pointsUsed: number;
  exchangeType: 'cash' | 'product';
  cashValue: number;
  productName: string;
  balanceBefore: number;
  balanceAfter: number;
  pointsBefore: number;
  pointsAfter: number;
  createdAt: string;
}

export interface RechargeRule {
  minAmount: number;
  bonusAmount: number;
}

export interface PointsRules {
  pointsPerYuan: number;
  exchangeRate: number;
  minPoints: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: 'haircut' | 'perm' | 'treatment' | 'other';
}

export interface BirthdayConfig {
  remindDays: number;
  couponAmount: number;
}

export interface SystemConfig {
  rechargeRules: RechargeRule[];
  pointsRules: PointsRules;
  services: ServiceItem[];
  birthdayConfig: BirthdayConfig;
}

export interface RechargeRequest {
  memberId: string;
  rechargeAmount: number;
}

export interface PointsExchangeRequest {
  memberId: string;
  pointsUsed: number;
  exchangeType: 'cash' | 'product';
  productName?: string;
}

export interface Coupon {
  id: string;
  memberId: string;
  name: string;
  amount: number;
  type: 'birthday' | 'discount' | 'gift';
  validFrom: string;
  validTo: string;
  status: 'unused' | 'used' | 'expired';
  usedAt: string | null;
  usedInRecordId: string | null;
  createdAt: string;
}

export interface CouponCreateRequest {
  memberId: string;
  name: string;
  amount: number;
  type: 'birthday' | 'discount' | 'gift';
  validFrom?: string;
  validTo?: string;
  validDays?: number;
}

export interface ConsumeRequest {
  memberId: string;
  serviceName: string;
  amount: number;
  payMethod: 'balance' | 'cash';
  couponId?: string;
  pointsUsed?: number;
}

export interface MarketingStatistics {
  couponsIssued: number;
  couponsUsed: number;
  couponsExpired: number;
  couponDiscountAmount: number;
  pointsDiscountAmount: number;
  totalDiscountAmount: number;
}

export interface MonthlyStatement {
  month: string;
  totalIncome: number;
  cashIncome: number;
  rechargeIncome: number;
  bonusAmount: number;
  balanceDeduction: number;
  couponDiscountAmount: number;
  pointsDiscountAmount: number;
  totalDiscountAmount: number;
  consumeCount: number;
  newMemberCount: number;
  totalConsumeAmount: number;
  originalConsumeAmount: number;
  marketing: MarketingStatistics;
}

export interface ReconciliationState {
  month: string;
  actualCashAmount: number;
  actualRechargeAmount: number;
  notes: string;
  reconciled: boolean;
  reconciledAt: string | null;
  reconciledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LedgerRecordType = 'consume' | 'recharge' | 'points_exchange' | 'coupon_use';

export interface LedgerRecord {
  id: string;
  type: LedgerRecordType;
  memberId: string;
  memberName: string;
  memberPhone: string;
  title: string;
  description: string;
  amount: number;
  balanceChange: number;
  pointsChange: number;
  balanceBefore: number;
  balanceAfter: number;
  pointsBefore: number;
  pointsAfter: number;
  couponName?: string;
  serviceName?: string;
  payMethod?: string;
  rawRecordId: string;
  createdAt: string;
}

export interface StatisticsData {
  cashIncome: number;
  rechargeIncome: number;
  totalIncome: number;
  consumeCount: number;
  memberCount: number;
  records: (ConsumeRecord | RechargeRecord)[];
  marketing: MarketingStatistics;
}
