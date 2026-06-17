import { create } from 'zustand';
import {
  memberApi,
  consumeApi,
  rechargeApi,
  pointsApi,
  statisticsApi,
  configApi,
  couponApi,
} from '../api/client.js';
import type {
  Member,
  ConsumeRecord,
  RechargeRecord,
  RechargeRule,
  PointsRules,
  ServiceItem,
  BirthdayConfig,
  StatisticsData,
  ConsumeRequest,
  RechargeRequest,
  PointsExchangeRequest,
  PointsExchange,
  Coupon,
  CouponCreateRequest,
} from '../../shared/types/index.js';

interface MemberRecordsResponse {
  member: Member;
  consumeRecords: ConsumeRecord[];
  rechargeRecords: RechargeRecord[];
  pointsRecords: PointsExchange[];
  coupons: Coupon[];
}

interface AddMemberResponse {
  member: Member;
  rechargeRecord?: RechargeRecord;
}

interface ConsumeResponse {
  record: ConsumeRecord;
  couponUsed?: Coupon;
  pointsUsed: number;
  pointsDiscount: number;
  actualAmount: number;
}

interface AppState {
  members: Member[];
  currentMember: Member | null;
  memberRecords: MemberRecordsResponse | null;
  memberCoupons: Coupon[];
  rechargeRules: RechargeRule[];
  pointsRules: PointsRules | null;
  services: ServiceItem[];
  birthdayConfig: BirthdayConfig | null;
  statistics: {
    daily: StatisticsData | null;
    weekly: StatisticsData | null;
    monthly: StatisticsData | null;
  };
  loading: boolean;
  error: string | null;

  fetchMembers: (keyword?: string) => Promise<void>;
  fetchMember: (id: string) => Promise<void>;
  fetchMemberRecords: (id: string) => Promise<void>;
  fetchMemberCoupons: (id: string) => Promise<void>;
  addMember: (data: Omit<Member, 'id' | 'createdAt' | 'lastVisitAt'> & { rechargeAmount?: number }) => Promise<AddMemberResponse>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  
  consume: (data: ConsumeRequest) => Promise<ConsumeResponse>;
  recharge: (data: RechargeRequest) => Promise<RechargeRecord>;
  exchangePoints: (data: PointsExchangeRequest) => Promise<void>;
  
  createCoupon: (data: CouponCreateRequest) => Promise<Coupon>;
  
  fetchStatistics: (type: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  fetchAllStatistics: () => Promise<void>;
  
  fetchConfig: () => Promise<void>;
  updateRechargeRules: (rules: RechargeRule[]) => Promise<void>;
  updatePointsRules: (rules: PointsRules) => Promise<void>;
  updateServices: (services: ServiceItem[]) => Promise<void>;
  updateBirthdayConfig: (config: BirthdayConfig) => Promise<void>;

  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  members: [],
  currentMember: null,
  memberRecords: null,
  memberCoupons: [],
  rechargeRules: [],
  pointsRules: null,
  services: [],
  birthdayConfig: null,
  statistics: {
    daily: null,
    weekly: null,
    monthly: null,
  },
  loading: false,
  error: null,

  fetchMembers: async (keyword) => {
    set({ loading: true, error: null });
    try {
      const res = await memberApi.getMembers(keyword);
      set({ members: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取会员列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMember: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await memberApi.getMember(id);
      set({ currentMember: res.data });
      set((state) => ({
        members: state.members.map(m => m.id === id ? res.data : m),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取会员信息失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMemberRecords: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await memberApi.getMemberRecords(id);
      set({ 
        memberRecords: res.data,
        currentMember: res.data.member,
        memberCoupons: res.data.coupons,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取会员记录失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMemberCoupons: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await couponApi.getCouponsByMember(id);
      set({ memberCoupons: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取会员优惠券失败' });
    } finally {
      set({ loading: false });
    }
  },

  addMember: async (data) => {
    set({ loading: true, error: null });
    try {
      const { rechargeAmount, ...memberData } = data;
      const res = await memberApi.addMember({ ...memberData, rechargeAmount });
      set((state) => ({ members: [...state.members, res.data.member] }));
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || '添加会员失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateMember: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await memberApi.updateMember(id, data);
      set((state) => ({
        members: state.members.map(m => m.id === id ? res.data : m),
        currentMember: state.currentMember?.id === id ? res.data : state.currentMember,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || '更新会员信息失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  consume: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await consumeApi.create(data);
      await get().fetchMember(data.memberId);
      await get().fetchMemberCoupons(data.memberId);
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || '消费失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  recharge: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await rechargeApi.create(data);
      await get().fetchMember(data.memberId);
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || '充值失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  exchangePoints: async (data) => {
    set({ loading: true, error: null });
    try {
      await pointsApi.exchange(data);
      await get().fetchMember(data.memberId);
    } catch (err: any) {
      set({ error: err.response?.data?.error || '积分兑换失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createCoupon: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await couponApi.createCoupon(data);
      await get().fetchMemberCoupons(data.memberId);
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || '发放优惠券失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchStatistics: async (type) => {
    set({ loading: true, error: null });
    try {
      let res;
      if (type === 'daily') {
        res = await statisticsApi.getDaily();
      } else if (type === 'weekly') {
        res = await statisticsApi.getWeekly();
      } else {
        res = await statisticsApi.getMonthly();
      }
      set((state) => ({
        statistics: { ...state.statistics, [type]: res.data },
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取统计数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const [daily, weekly, monthly] = await Promise.all([
        statisticsApi.getDaily(),
        statisticsApi.getWeekly(),
        statisticsApi.getMonthly(),
      ]);
      set({
        statistics: {
          daily: daily.data,
          weekly: weekly.data,
          monthly: monthly.data,
        },
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取统计数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const [rechargeRules, pointsRules, services, birthdayConfig] = await Promise.all([
        configApi.getRechargeRules(),
        configApi.getPointsRules(),
        configApi.getServices(),
        configApi.getBirthdayConfig(),
      ]);
      set({
        rechargeRules: rechargeRules.data,
        pointsRules: pointsRules.data,
        services: services.data,
        birthdayConfig: birthdayConfig.data,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '获取配置失败' });
    } finally {
      set({ loading: false });
    }
  },

  updateRechargeRules: async (rules) => {
    set({ loading: true, error: null });
    try {
      const res = await configApi.updateRechargeRules(rules);
      set({ rechargeRules: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '更新充值规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updatePointsRules: async (rules) => {
    set({ loading: true, error: null });
    try {
      const res = await configApi.updatePointsRules(rules);
      set({ pointsRules: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '更新积分规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateServices: async (services) => {
    set({ loading: true, error: null });
    try {
      const res = await configApi.updateServices(services);
      set({ services: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '更新服务项目失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateBirthdayConfig: async (config) => {
    set({ loading: true, error: null });
    try {
      const res = await configApi.updateBirthdayConfig(config);
      set({ birthdayConfig: res.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '更新生日提醒配置失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
