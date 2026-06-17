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
  X,
  Receipt,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { memberApi, statisticsApi } from '../api/client.js';
import { formatCurrency, formatDate, formatDateTime, formatPhone, getAge } from '../utils/format.js';
import type { ConsumeRecord, RechargeRecord, PointsExchange, Coupon, LedgerRecord } from '../../shared/types/index.js';

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
  const [activeTab, setActiveTab] = useState<'consume' | 'recharge' | 'points' | 'coupons' | 'ledger'>('consume');
  const [selectedRecord, setSelectedRecord] = useState<ConsumeRecord | null>(null);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<LedgerRecord | null>(null);

  useEffect(() => {
    if (id) {
      loadMemberData(id);
      loadLedger(id);
    }
  }, [id]);

  const loadLedger = async (memberId: string) => {
    setLedgerLoading(true);
    try {
      const res = await statisticsApi.getMemberLedger(memberId);
      setLedgerRecords(res.data);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLedgerLoading(false);
    }
  };

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
    { key: 'ledger', label: '会员账本', count: ledgerRecords.length, icon: BookOpen },
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
          {activeTab === 'ledger' && (
            <div className="space-y-2">
              {ledgerLoading ? (
                <div className="text-center py-12 text-primary-400">
                  <div className="animate-spin w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-2" />
                  <p>加载中...</p>
                </div>
              ) : ledgerRecords.length > 0 ? (
                ledgerRecords.map((record) => {
                  const typeConfig: Record<string, { bg: string; color: string; label: string; icon: any }> = {
                    consume: { bg: 'bg-blue-100', color: 'text-blue-600', label: '消费', icon: CreditCard },
                    recharge: { bg: 'bg-green-100', color: 'text-green-600', label: '充值', icon: TrendingUp },
                    coupon_use: { bg: 'bg-accent-100', color: 'text-accent-600', label: '用券', icon: Ticket },
                    points_exchange: { bg: 'bg-purple-100', color: 'text-purple-600', label: '积分兑换', icon: Gift },
                  };
                  const cfg = typeConfig[record.type] || typeConfig.consume;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={record.id}
                      onClick={() => setSelectedLedger(record)}
                      className="w-full text-left flex items-center justify-between p-3 hover:bg-primary-50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.color} shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary-800 truncate">{record.title}</p>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-primary-500 truncate">{record.description}</p>
                          <p className="text-xs text-primary-400">{formatDateTime(record.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {record.balanceChange !== 0 && (
                            <p className={`text-sm font-semibold ${record.balanceChange > 0 ? 'text-green-600' : 'text-primary-700'}`}>
                              {record.balanceChange > 0 ? '+' : ''}{formatCurrency(record.balanceChange)}
                            </p>
                          )}
                          {record.pointsChange !== 0 && (
                            <p className={`text-xs ${record.pointsChange > 0 ? 'text-accent-600' : 'text-purple-600'}`}>
                              {record.pointsChange > 0 ? '+' : ''}{record.pointsChange} 分
                            </p>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-primary-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 text-primary-400">
                  <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无账本记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consume' && (
            <div className="space-y-3">
              {consumeRecords.length > 0 ? (
                consumeRecords.map((record) => {
                  const hasDiscount = (record.couponDiscount > 0 || record.pointsDiscount > 0);
                  return (
                    <button
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="w-full text-left p-4 bg-primary-50/50 rounded-xl hover:bg-primary-100/50 transition-colors"
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
                            {formatCurrency(record.amount)}
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
                    </button>
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

      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-600 flex items-center justify-center">
                    <Receipt size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-primary-800">消费小票</h3>
                    <p className="text-xs text-primary-500">{selectedRecord.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-full hover:bg-primary-100 flex items-center justify-center text-primary-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-500 mb-1">服务项目</p>
                  <p className="font-semibold text-primary-800 text-lg">{selectedRecord.serviceName}</p>
                  <p className="text-xs text-primary-400 mt-1">
                    {formatDateTime(selectedRecord.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-500">原价</span>
                    <span className="text-primary-700">{formatCurrency(selectedRecord.originalAmount)}</span>
                  </div>

                  {selectedRecord.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm items-start">
                      <span className="text-accent-600 flex items-center gap-1">
                        <Ticket size={14} />
                        优惠券抵扣
                      </span>
                      <div className="text-right">
                        <span className="text-accent-600 font-medium">
                          - {formatCurrency(selectedRecord.couponDiscount)}
                        </span>
                        {selectedRecord.couponName && (
                          <p className="text-xs text-accent-500 mt-0.5">（{selectedRecord.couponName}）</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedRecord.pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600 flex items-center gap-1">
                        <Gift size={14} />
                        积分抵扣 ({selectedRecord.pointsUsed} 分)
                      </span>
                      <span className="text-purple-600 font-medium">
                        - {formatCurrency(selectedRecord.pointsDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-primary-100 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-primary-700">实付金额</span>
                      <span className="font-bold text-primary-800 text-lg">
                        {formatCurrency(selectedRecord.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-accent-50 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">支付方式</span>
                    <span className="font-medium text-primary-800">
                      {selectedRecord.payMethod === 'balance' ? '会员卡余额' : '现金'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">获得积分</span>
                    <span className="font-medium text-accent-600">
                      + {selectedRecord.pointsEarned} 分
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-blue-700 mb-1">余额变化</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">扣前余额</span>
                    <span className="font-medium text-blue-800">
                      {formatCurrency(selectedRecord.balanceBefore ?? 0)}
                    </span>
                  </div>
                  {selectedRecord.payMethod === 'balance' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">本次扣除</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(selectedRecord.amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">扣后余额</span>
                    <span className="font-semibold text-blue-800">
                      {formatCurrency(selectedRecord.balanceAfter ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-purple-700 mb-1">积分变化</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">扣前积分</span>
                    <span className="font-medium text-purple-800">
                      {selectedRecord.pointsBefore ?? 0} 分
                    </span>
                  </div>
                  {selectedRecord.pointsUsed > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">本次消耗</span>
                      <span className="font-medium text-red-600">
                        - {selectedRecord.pointsUsed} 分
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">本次获得</span>
                    <span className="font-medium text-accent-600">
                      + {selectedRecord.pointsEarned} 分
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">扣后积分</span>
                    <span className="font-semibold text-purple-800">
                      {selectedRecord.pointsAfter ?? 0} 分
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs text-primary-400 pt-2 border-t border-dashed border-primary-200">
                  凭此小票可享受售后服务 · 谢谢光临
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLedger && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLedger(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-600 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-primary-800">{selectedLedger.title}</h3>
                    <p className="text-xs text-primary-500">
                      {formatDateTime(selectedLedger.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLedger(null)}
                  className="w-8 h-8 rounded-full hover:bg-primary-100 flex items-center justify-center text-primary-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-xs text-primary-500 mb-1">操作描述</p>
                  <p className="text-sm text-primary-800">{selectedLedger.description}</p>
                  {selectedLedger.payMethod && (
                    <p className="text-xs text-primary-500 mt-2">
                      支付方式: {selectedLedger.payMethod}
                    </p>
                  )}
                </div>

                {(selectedLedger.balanceBefore !== undefined || selectedLedger.balanceChange !== 0) && (
                  <div className="p-3 bg-blue-50 rounded-xl space-y-2">
                    <p className="text-xs font-medium text-blue-700 mb-1">余额变化</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">操作前</span>
                      <span className="font-medium text-blue-800">
                        {formatCurrency(selectedLedger.balanceBefore)}
                      </span>
                    </div>
                    {selectedLedger.balanceChange !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">本次变化</span>
                        <span className={`font-medium ${selectedLedger.balanceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedLedger.balanceChange > 0 ? '+' : ''}{formatCurrency(selectedLedger.balanceChange)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">操作后</span>
                      <span className="font-semibold text-blue-800">
                        {formatCurrency(selectedLedger.balanceAfter)}
                      </span>
                    </div>
                  </div>
                )}

                {(selectedLedger.pointsBefore !== undefined || selectedLedger.pointsChange !== 0) && (
                  <div className="p-3 bg-purple-50 rounded-xl space-y-2">
                    <p className="text-xs font-medium text-purple-700 mb-1">积分变化</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">操作前</span>
                      <span className="font-medium text-purple-800">
                        {selectedLedger.pointsBefore} 分
                      </span>
                    </div>
                    {selectedLedger.pointsChange !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">本次变化</span>
                        <span className={`font-medium ${selectedLedger.pointsChange > 0 ? 'text-accent-600' : 'text-red-600'}`}>
                          {selectedLedger.pointsChange > 0 ? '+' : ''}{selectedLedger.pointsChange} 分
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">操作后</span>
                      <span className="font-semibold text-purple-800">
                        {selectedLedger.pointsAfter} 分
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-primary-400 pt-2 border-t border-dashed border-primary-200">
                  记录编号: {selectedLedger.rawRecordId}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
