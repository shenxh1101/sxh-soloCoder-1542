import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Wallet,
  Gift,
  Clock,
  CreditCard,
  TrendingUp,
  History,
  Ticket,
  CheckCircle,
  XCircle,
  Clock3,
} from 'lucide-react';
import { memberApi } from '../api/client.js';
import { formatCurrency, formatDate, formatDateTime, formatPhone, getAge } from '../utils/format.js';
import type { ConsumeRecord, RechargeRecord, PointsExchange, Coupon } from '../../shared/types/index.js';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<{
    member: any;
    consumeRecords: ConsumeRecord[];
    rechargeRecords: RechargeRecord[];
    pointsRecords: PointsExchange[];
    coupons: Coupon[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'consume' | 'recharge' | 'points' | 'coupons'>('consume');

  useEffect(() => {
    if (id) {
      loadMemberData(id);
    }
  }, [id]);

  const loadMemberData = async (memberId: string) => {
    setLoading(true);
    try {
      const res = await memberApi.getMemberRecords(memberId);
      setMemberData(res.data);
    } catch (err) {
      console.error('Failed to load member:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">会员不存在</p>
        <Link to="/members" className="btn-primary">
          返回会员列表
        </Link>
      </div>
    );
  }

  const { member, consumeRecords, rechargeRecords, pointsRecords, coupons } = memberData;
  const totalConsume = consumeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalRecharge = rechargeRecords.reduce((sum, r) => sum + r.rechargeAmount, 0);
  const totalBonus = rechargeRecords.reduce((sum, r) => sum + r.bonusAmount, 0);

  const tabs = [
    { key: 'consume', label: '消费记录', count: consumeRecords.length, icon: CreditCard },
    { key: 'recharge', label: '充值记录', count: rechargeRecords.length, icon: TrendingUp },
    { key: 'points', label: '积分记录', count: pointsRecords.length, icon: History },
    { key: 'coupons', label: '优惠券', count: coupons.length, icon: Ticket },
  ];

  const unusedCoupons = coupons.filter(c => c.status === 'unused');
  const usedCoupons = coupons.filter(c => c.status === 'used');
  const expiredCoupons = coupons.filter(c => c.status === 'expired');

  const getCouponStatusIcon = (status: string) => {
    switch (status) {
      case 'unused': return <Clock3 size={14} className="text-blue-500" />;
      case 'used': return <CheckCircle size={14} className="text-green-500" />;
      case 'expired': return <XCircle size={14} className="text-gray-400" />;
      default: return null;
    }
  };

  const getCouponStatusText = (status: string) => {
    switch (status) {
      case 'unused': return '未使用';
      case 'used': return '已使用';
      case 'expired': return '已过期';
      default: return status;
    }
  };

  const getCouponStatusClass = (status: string) => {
    switch (status) {
      case 'unused': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'used': return 'bg-green-50 text-green-700 border-green-200';
      case 'expired': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/members" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={20} />
          返回列表
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-serif text-3xl font-bold">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-bold text-primary-800 mb-2">
              {member.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-primary-600">
              <span className="flex items-center gap-1">
                <Phone size={16} />
                {formatPhone(member.phone)}
              </span>
              {member.birthday && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(member.birthday)} ({getAge(member.birthday)}岁)
                </span>
              )}
              {member.lastVisitAt && (
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  上次消费: {formatDate(member.lastVisitAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-4 bg-accent-50 rounded-xl">
              <Wallet size={20} className="mx-auto mb-1 text-accent-600" />
              <p className="text-xs text-primary-500">余额</p>
              <p className="text-xl font-bold text-primary-800">{formatCurrency(member.balance)}</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <Gift size={20} className="mx-auto mb-1 text-primary-600" />
              <p className="text-xs text-primary-500">积分</p>
              <p className="text-xl font-bold text-primary-800">{member.points}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-800">{formatCurrency(totalConsume)}</p>
            <p className="text-sm text-primary-500">累计消费</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRecharge)}</p>
            <p className="text-sm text-primary-500">累计充值</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-600">{formatCurrency(totalBonus)}</p>
            <p className="text-sm text-primary-500">累计赠送</p>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-primary-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  isActive
                    ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-primary-500 hover:text-primary-700 hover:bg-primary-50/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'consume' && (
            <div className="space-y-3">
              {consumeRecords.length > 0 ? (
                consumeRecords.map((record) => {
                  const hasDiscount = (record.couponDiscount > 0 || record.pointsDiscount > 0);
                  return (
                    <div
                      key={record.id}
                      className="p-4 bg-primary-50/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-primary-800">{record.serviceName}</p>
                            <p className="text-sm text-primary-500">{formatDateTime(record.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-800">
                            {hasDiscount ? formatCurrency(record.amount) : formatCurrency(record.amount)}
                          </p>
                          <p className="text-xs text-primary-500">
                            {record.payMethod === 'balance' ? '余额支付' : '现金支付'}
                          </p>
                        </div>
                      </div>
                      {hasDiscount && (
                        <div className="mt-2 pt-2 border-t border-primary-100 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-primary-500">原价</span>
                            <span className="text-primary-700">{formatCurrency(record.originalAmount)}</span>
                          </div>
                          {record.couponDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-accent-600">优惠券抵扣</span>
                              <span className="text-accent-600 font-medium">- {formatCurrency(record.couponDiscount)}</span>
                            </div>
                          )}
                          {record.pointsDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-purple-600">积分抵扣 ({record.pointsUsed}分)</span>
                              <span className="text-purple-600 font-medium">- {formatCurrency(record.pointsDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-primary-700">实付</span>
                            <span className="text-primary-800">{formatCurrency(record.amount)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-primary-500">
                          {record.payMethod === 'balance' ? '余额支付' : '现金支付'}
                        </span>
                        <span className="text-accent-600">+{record.pointsEarned} 积分</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-primary-400">
                  <CreditCard size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无消费记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recharge' && (
            <div className="space-y-3">
              {rechargeRecords.length > 0 ? (
                rechargeRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-green-50/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-primary-800">会员卡充值</p>
                        <p className="text-sm text-primary-500">{formatDateTime(record.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+ {formatCurrency(record.rechargeAmount)}</p>
                      {record.bonusAmount > 0 && (
                        <p className="text-xs text-accent-600">赠送 {formatCurrency(record.bonusAmount)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-primary-400">
                  <TrendingUp size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无充值记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-3">
              {pointsRecords.length > 0 ? (
                pointsRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-accent-50/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                        <Gift size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-primary-800">
                          {record.exchangeType === 'cash' ? '积分抵现' : `兑换: ${record.productName}`}
                        </p>
                        <p className="text-sm text-primary-500">{formatDateTime(record.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-600">- {record.pointsUsed} 积分</p>
                      {record.cashValue > 0 && (
                        <p className="text-xs text-primary-500">抵现 {formatCurrency(record.cashValue)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-primary-400">
                  <History size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无积分记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {unusedCoupons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                    <Clock3 size={16} className="text-blue-500" />
                    未使用 ({unusedCoupons.length})
                  </h4>
                  <div className="space-y-3">
                    {unusedCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border-2 border-blue-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Ticket size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-primary-800">{coupon.name}</p>
                            <p className="text-sm text-primary-500">
                              有效期: {coupon.validFrom} 至 {coupon.validTo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent-600">{formatCurrency(coupon.amount)}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCouponStatusClass(coupon.status)}`}>
                            {getCouponStatusIcon(coupon.status)}
                            {getCouponStatusText(coupon.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usedCoupons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    已使用 ({usedCoupons.length})
                  </h4>
                  <div className="space-y-3">
                    {usedCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 bg-green-50/30 rounded-xl border-2 border-green-100 opacity-75"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <Ticket size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-primary-800">{coupon.name}</p>
                            <p className="text-sm text-primary-500">
                              使用时间: {coupon.usedAt ? formatDateTime(coupon.usedAt) : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-500 line-through">{formatCurrency(coupon.amount)}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCouponStatusClass(coupon.status)}`}>
                            {getCouponStatusIcon(coupon.status)}
                            {getCouponStatusText(coupon.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiredCoupons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                    <XCircle size={16} className="text-gray-400" />
                    已过期 ({expiredCoupons.length})
                  </h4>
                  <div className="space-y-3">
                    {expiredCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 bg-gray-50/30 rounded-xl border-2 border-gray-100 opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <Ticket size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-primary-800">{coupon.name}</p>
                            <p className="text-sm text-primary-500">
                              有效期至: {coupon.validTo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-400 line-through">{formatCurrency(coupon.amount)}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCouponStatusClass(coupon.status)}`}>
                            {getCouponStatusIcon(coupon.status)}
                            {getCouponStatusText(coupon.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {coupons.length === 0 && (
                <div className="text-center py-12 text-primary-400">
                  <Ticket size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无优惠券记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
