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
  serviceName: string;
  amount: number;
  payMethod: 'balance' | 'cash';
  pointsEarned: number;
  createdAt: string;
}

export interface RechargeRecord {
  id: string;
  memberId: string;
  rechargeAmount: number;
  bonusAmount: number;
  createdAt: string;
}

export interface PointsExchange {
  id: string;
  memberId: string;
  pointsUsed: number;
  exchangeType: 'cash' | 'product';
  cashValue: number;
  productName: string;
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

export interface StatisticsData {
  cashIncome: number;
  rechargeIncome: number;
  totalIncome: number;
  consumeCount: number;
  memberCount: number;
  records: (ConsumeRecord | RechargeRecord)[];
  marketing: MarketingStatistics;
}
