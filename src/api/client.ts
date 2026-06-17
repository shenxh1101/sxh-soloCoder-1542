import axios from 'axios';
import type {
  Member,
  ConsumeRecord,
  RechargeRecord,
  PointsExchange,
  RechargeRule,
  PointsRules,
  ServiceItem,
  BirthdayConfig,
  StatisticsData,
  ConsumeRequest,
  RechargeRequest,
  PointsExchangeRequest,
} from '../../shared/types/index.js';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const memberApi = {
  getMembers: (keyword?: string) =>
    api.get<Member[]>('/members', { params: { keyword } }),
  getMember: (id: string) =>
    api.get<Member>(`/members/${id}`),
  getMemberRecords: (id: string) =>
    api.get<{
      member: Member;
      consumeRecords: ConsumeRecord[];
      rechargeRecords: RechargeRecord[];
      pointsRecords: PointsExchange[];
    }>(`/members/${id}/records`),
  getUpcomingBirthdays: () =>
    api.get<(Member & { daysUntilBirthday: number })[]>('/members/birthdays'),
  addMember: (data: Omit<Member, 'id' | 'createdAt' | 'lastVisitAt'>) =>
    api.post<Member>('/members', data),
  updateMember: (id: string, data: Partial<Member>) =>
    api.put<Member>(`/members/${id}`, data),
};

export const consumeApi = {
  getRecords: () =>
    api.get<ConsumeRecord[]>('/consume'),
  create: (data: ConsumeRequest) =>
    api.post<ConsumeRecord>('/consume', data),
};

export const rechargeApi = {
  getRecords: () =>
    api.get<RechargeRecord[]>('/recharge'),
  getBonus: (amount: number) =>
    api.get<{ bonus: number }>(`/recharge/bonus/${amount}`),
  create: (data: RechargeRequest) =>
    api.post<RechargeRecord>('/recharge', data),
};

export const pointsApi = {
  getRecords: () =>
    api.get<PointsExchange[]>('/points'),
  exchange: (data: PointsExchangeRequest) =>
    api.post<PointsExchange>('/points/exchange', data),
};

export const statisticsApi = {
  getDaily: () =>
    api.get<StatisticsData>('/statistics/daily'),
  getWeekly: () =>
    api.get<StatisticsData>('/statistics/weekly'),
  getMonthly: () =>
    api.get<StatisticsData>('/statistics/monthly'),
  getTrend: (days?: number) =>
    api.get<{ date: string; cash: number; recharge: number }[]>('/statistics/trend', { params: { days } }),
};

export const configApi = {
  getRechargeRules: () =>
    api.get<RechargeRule[]>('/config/recharge-rules'),
  updateRechargeRules: (rules: RechargeRule[]) =>
    api.put<RechargeRule[]>('/config/recharge-rules', rules),
  getPointsRules: () =>
    api.get<PointsRules>('/config/points-rules'),
  updatePointsRules: (rules: PointsRules) =>
    api.put<PointsRules>('/config/points-rules', rules),
  getServices: () =>
    api.get<ServiceItem[]>('/config/services'),
  updateServices: (services: ServiceItem[]) =>
    api.put<ServiceItem[]>('/config/services', services),
  getBirthdayConfig: () =>
    api.get<BirthdayConfig>('/config/birthday-config'),
  updateBirthdayConfig: (config: BirthdayConfig) =>
    api.put<BirthdayConfig>('/config/birthday-config', config),
};
