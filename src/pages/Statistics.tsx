import { useEffect, useState } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Ticket,
  Gift,
  BarChart3,
  CheckCircle,
  Send,
} from 'lucide-react';
import { useAppStore } from '../store/index.js';
import StatCard from '../components/StatCard.js';
import { formatCurrency, formatDate, formatTime } from '../utils/format.js';
import type { ConsumeRecord, RechargeRecord } from '../../shared/types/index.js';
import { statisticsApi } from '../api/client.js';

type TabType = 'daily' | 'weekly' | 'monthly';

export default function Statistics() {
  const { statistics, fetchAllStatistics, fetchConfig } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [trendData, setTrendData] = useState<{ date: string; cash: number; recharge: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAllStatistics();
    fetchConfig();
    loadTrendData();
  }, [fetchAllStatistics, fetchConfig]);

  const loadTrendData = async () => {
    try {
      const res = await statisticsApi.getTrend(7);
      setTrendData(res.data);
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || '获取趋势数据失败', type: 'error' });
    }
  };

  const tabs = [
    { key: 'daily' as TabType, label: '今日' },
    { key: 'weekly' as TabType, label: '本周' },
    { key: 'monthly' as TabType, label: '本月' },
  ];

  const currentStats = statistics[activeTab];

  const maxTrendValue = Math.max(...trendData.map(d => d.cash + d.recharge), 1);

  const records = currentStats?.records || [];
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const isConsumeRecord = (r: ConsumeRecord | RechargeRecord): r is ConsumeRecord => {
    return 'serviceName' in r;
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 p-1 bg-primary-50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-primary-700 shadow-md'
                  : 'text-primary-500 hover:text-primary-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总营业额"
          value={formatCurrency(currentStats?.totalIncome || 0)}
          icon={Wallet}
          gradient="from-primary-500 to-primary-700"
        />
        <StatCard
          title="现金收入"
          value={formatCurrency(currentStats?.cashIncome || 0)}
          icon={CreditCard}
          gradient="from-accent-500 to-accent-700"
        />
        <StatCard
          title="会员卡充值"
          value={formatCurrency(currentStats?.rechargeIncome || 0)}
          icon={ShoppingBag}
          gradient="from-green-500 to-green-700"
        />
        <StatCard
          title="消费单数"
          value={`${currentStats?.consumeCount || 0} 单`}
          icon={TrendingUp}
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-600 flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary-800">营销统计</h3>
            <p className="text-sm text-primary-500">优惠券和积分抵扣情况</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                <Send size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-pink-600">本月发券</p>
                <p className="text-2xl font-bold text-pink-700">
                  {currentStats?.marketing?.couponsIssued || 0} 张
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-pink-500">
              <Ticket size={12} />
              生日券 {currentStats?.marketing?.couponsIssued || 0} 张
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <CheckCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">本月用券</p>
                <p className="text-2xl font-bold text-green-700">
                  {currentStats?.marketing?.couponsUsed || 0} 张
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <Ticket size={12} />
              使用率 {currentStats?.marketing?.couponsIssued 
                ? Math.round((currentStats.marketing.couponsUsed / currentStats.marketing.couponsIssued) * 100) 
                : 0}%
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Gift size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600">累计抵扣</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatCurrency(currentStats?.marketing?.totalDiscountAmount || 0)}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-purple-500">
              <div className="flex items-center gap-2">
                <Ticket size={12} />
                优惠券抵扣 {formatCurrency(currentStats?.marketing?.couponDiscountAmount || 0)}
              </div>
              <div className="flex items-center gap-2">
                <Gift size={12} />
                积分抵扣 {formatCurrency(currentStats?.marketing?.pointsDiscountAmount || 0)}
              </div>
            </div>
          </div>
        </div>

        {currentStats?.marketing?.couponsExpired > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Ticket size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">
                本月有 <span className="font-semibold">{currentStats.marketing.couponsExpired}</span> 张优惠券已过期未使用
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-primary-800">收入趋势</h3>
                <p className="text-sm text-primary-500">最近7天</p>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {trendData.map((item, index) => {
              const total = item.cash + item.recharge;
              const height = (total / maxTrendValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-48 gap-1">
                    {total > 0 && (
                      <span className="text-xs text-primary-600 font-medium">
                        {formatCurrency(total)}
                      </span>
                    )}
                    <div className="w-full flex gap-0.5 h-full items-end">
                      <div
                        className="flex-1 bg-gradient-to-t from-accent-500 to-accent-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(item.cash / maxTrendValue) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(item.recharge / maxTrendValue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-primary-500 mt-2">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-primary-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-accent-500 to-accent-400" />
              <span className="text-sm text-primary-600">现金收入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-green-400" />
              <span className="text-sm text-primary-600">充值收入</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <Calendar size={20} className="text-accent-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary-800">交易明细</h3>
              <p className="text-sm text-primary-500">最近交易记录</p>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-primary-50/50 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isConsumeRecord(record)
                        ? 'bg-accent-100'
                        : 'bg-green-100'
                    }`}>
                      {isConsumeRecord(record) ? (
                        <ShoppingBag size={18} className="text-accent-600" />
                      ) : (
                        <Wallet size={18} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-primary-800">
                        {isConsumeRecord(record) ? record.serviceName : '会员充值'}
                      </p>
                      <p className="text-xs text-primary-500">
                        {formatDate(record.createdAt)} {formatTime(record.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isConsumeRecord(record) ? 'text-accent-600' : 'text-green-600'
                    }`}>
                      {isConsumeRecord(record) ? '+' : '+'}
                      {formatCurrency(isConsumeRecord(record) ? record.amount : (record as RechargeRecord).rechargeAmount)}
                    </p>
                    <p className="text-xs text-primary-500">
                      {isConsumeRecord(record)
                        ? record.payMethod === 'cash' ? '现金支付' : '余额支付'
                        : `赠送 ${formatCurrency((record as RechargeRecord).bonusAmount)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-primary-400">
                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                <p>暂无交易记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary-800">数据对比</h3>
            <p className="text-sm text-primary-500">各时间段营业数据对比</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => {
            const data = statistics[tab.key];
            const prevTab = tab.key === 'daily' ? 'weekly' : tab.key === 'weekly' ? 'monthly' : 'daily';
            const prevData = statistics[prevTab];
            const growth = prevData?.totalIncome
              ? ((data?.totalIncome || 0) - prevData.totalIncome) / prevData.totalIncome * 100
              : 0;

            return (
              <div
                key={tab.key}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-transparent bg-white'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-primary-700">{tab.label}</h4>
                  {prevData?.totalIncome && (
                    <div className={`flex items-center gap-1 text-sm ${
                      growth >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {growth >= 0 ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      <span>{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-primary-800 mb-2">
                  {formatCurrency(data?.totalIncome || 0)}
                </p>
                <div className="flex items-center justify-between text-sm text-primary-500">
                  <span>现金 {formatCurrency(data?.cashIncome || 0)}</span>
                  <span>充值 {formatCurrency(data?.rechargeIncome || 0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
