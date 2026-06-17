import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CreditCard,
  Users,
  ShoppingBag,
  Plus,
  Cake,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store/index.js';
import StatCard from '../components/StatCard.js';
import BirthdayCard from '../components/BirthdayCard.js';
import { formatCurrency } from '../utils/format.js';
import type { Member } from '../../shared/types/index.js';
import { memberApi } from '../api/client.js';

export default function Dashboard() {
  const { statistics, birthdayConfig, fetchAllStatistics, fetchConfig } = useAppStore();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<(Member & { daysUntilBirthday: number })[]>([]);

  useEffect(() => {
    fetchAllStatistics();
    fetchConfig();
    loadBirthdays();
  }, [fetchAllStatistics, fetchConfig]);

  const loadBirthdays = async () => {
    try {
      const res = await memberApi.getUpcomingBirthdays();
      setUpcomingBirthdays(res.data);
    } catch (err) {
      console.error('Failed to load birthdays:', err);
    }
  };

  const dailyStats = statistics.daily;

  const quickActions = [
    { label: '新增会员', icon: Plus, path: '/members/new', gradient: 'from-primary-500 to-primary-700' },
    { label: '消费收银', icon: CreditCard, path: '/checkout', gradient: 'from-accent-500 to-accent-700' },
    { label: '会员卡充值', icon: Wallet, path: '/recharge', gradient: 'from-green-500 to-green-700' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日营业额"
          value={formatCurrency(dailyStats?.totalIncome || 0)}
          icon={Wallet}
          gradient="from-primary-500 to-primary-700"
        />
        <StatCard
          title="今日现金收入"
          value={formatCurrency(dailyStats?.cashIncome || 0)}
          icon={CreditCard}
          gradient="from-accent-500 to-accent-700"
        />
        <StatCard
          title="今日充值"
          value={formatCurrency(dailyStats?.rechargeIncome || 0)}
          icon={ShoppingBag}
          gradient="from-green-500 to-green-700"
        />
        <StatCard
          title="今日消费单数"
          value={`${dailyStats?.consumeCount || 0} 单`}
          icon={Users}
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className={`p-6 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{action.label}</h3>
                  <p className="text-white/80 text-sm">点击进入</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-sm text-white/80">
                <span>去操作</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Cake size={20} className="text-pink-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary-800">近期生日会员</h3>
              <p className="text-sm text-primary-500">
                未来 {birthdayConfig?.remindDays || 7} 天内即将过生日的会员
              </p>
            </div>
          </div>
        </div>

        {upcomingBirthdays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBirthdays.map((member) => (
              <BirthdayCard
                key={member.id}
                member={member}
                couponAmount={birthdayConfig?.couponAmount || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-primary-400">
            <Cake size={48} className="mx-auto mb-3 opacity-50" />
            <p>近期没有即将过生日的会员</p>
          </div>
        )}
      </div>
    </div>
  );
}
