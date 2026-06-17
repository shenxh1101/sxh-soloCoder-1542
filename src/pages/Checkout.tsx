import { useState, useEffect, useMemo } from 'react';
import { Search, User, Wallet, CreditCard, Gift, CheckCircle, Ticket, Minus, Plus } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import ServiceCard from '../components/ServiceCard.js';
import Toast from '../components/Toast.js';
import { formatCurrency, formatPhone } from '../utils/format.js';
import type { ServiceItem, Coupon } from '../../shared/types/index.js';
import { couponApi } from '../api/client.js';

export default function Checkout() {
  const { members, services, pointsRules, fetchMembers, fetchConfig, consume, loading } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [memberCoupons, setMemberCoupons] = useState<Coupon[]>([]);
  const [payMethod, setPayMethod] = useState<'balance' | 'cash'>('balance');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [consumeResult, setConsumeResult] = useState<{
    originalAmount: number;
    actualAmount: number;
    couponUsed?: Coupon;
    pointsUsed: number;
    pointsEarned: number;
  } | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchConfig();
  }, [fetchMembers, fetchConfig]);

  const selectedMember = useMemo(
    () => selectedMemberId ? members.find(m => m.id === selectedMemberId) ?? null : null,
    [selectedMemberId, members]
  );

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberCoupons(selectedMemberId);
    } else {
      setMemberCoupons([]);
      setSelectedCoupon(null);
      setPointsToUse(0);
    }
  }, [selectedMemberId]);

  useEffect(() => {
    if (selectedCoupon && !memberCoupons.find(c => c.id === selectedCoupon.id)) {
      setSelectedCoupon(null);
    }
  }, [memberCoupons, selectedCoupon]);

  const loadMemberCoupons = async (memberId: string) => {
    try {
      const res = await couponApi.getUnusedCouponsByMember(memberId);
      setMemberCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.includes(searchKeyword) || m.phone.includes(searchKeyword)
  ).slice(0, 5);

  const couponDiscount = selectedCoupon ? selectedCoupon.amount : 0;
  const pointsDiscount = pointsRules && pointsToUse > 0
    ? Math.floor(pointsToUse / pointsRules.exchangeRate) * 100
    : 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const originalAmount = selectedService?.price || 0;
  const actualAmount = Math.max(0, originalAmount - totalDiscount);

  const estimatedPoints = pointsRules && selectedService
    ? Math.floor(actualAmount / 100 * pointsRules.pointsPerYuan)
    : 0;

  const maxPointsToUse = selectedMember?.points || 0;
  const minPointsToUse = pointsRules?.minPoints || 100;

  const canPayWithBalance = selectedMember && selectedMember.balance >= actualAmount;

  const handlePointsChange = (delta: number) => {
    if (!pointsRules) return;
    const newValue = pointsToUse + delta;
    if (newValue < 0) return;
    if (newValue > maxPointsToUse) return;
    if (newValue > 0 && newValue < minPointsToUse) {
      setPointsToUse(minPointsToUse);
    } else {
      setPointsToUse(newValue);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      setToast({ message: '请选择会员', type: 'error' });
      return;
    }
    if (!selectedService) {
      setToast({ message: '请选择服务项目', type: 'error' });
      return;
    }
    if (payMethod === 'balance' && !canPayWithBalance) {
      setToast({ message: '会员余额不足', type: 'error' });
      return;
    }
    if (pointsToUse > 0 && (!pointsRules || pointsToUse < pointsRules.minPoints)) {
      setToast({ message: `最低使用 ${pointsRules?.minPoints || 100} 积分`, type: 'error' });
      return;
    }

    try {
      const result = await consume({
        memberId: selectedMember.id,
        serviceName: selectedService.name,
        amount: selectedService.price,
        payMethod,
        couponId: selectedCoupon?.id,
        pointsUsed: pointsToUse > 0 ? pointsToUse : undefined,
      });
      
      setConsumeResult({
        originalAmount: selectedService.price,
        actualAmount: result.actualAmount,
        couponUsed: result.couponUsed,
        pointsUsed: result.pointsUsed,
        pointsEarned: result.record.pointsEarned,
      });
      
      setShowSuccess(true);
      setToast({ message: '消费成功！', type: 'success' });
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedService(null);
        setSelectedCoupon(null);
        setPointsToUse(0);
        setConsumeResult(null);
        if (selectedMemberId) {
          loadMemberCoupons(selectedMemberId);
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to consume:', err);
    }
  };

  if (showSuccess && consumeResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fadeIn max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary-800 mb-2">消费成功</h2>
          <p className="text-primary-500 mb-6">
            {selectedMember?.name} 消费 {formatCurrency(consumeResult.actualAmount)}
          </p>
          
          <div className="card text-left mb-6">
            <h3 className="font-semibold text-primary-800 mb-4">消费详情</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-600">原价</span>
                <span className="font-medium text-primary-800">{formatCurrency(consumeResult.originalAmount)}</span>
              </div>
              {consumeResult.couponUsed && (
                <div className="flex justify-between text-accent-600">
                  <span>优惠券抵扣</span>
                  <span className="font-semibold">- {formatCurrency(consumeResult.couponUsed.amount)}</span>
                </div>
              )}
              {consumeResult.pointsUsed > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>积分抵扣 ({consumeResult.pointsUsed}分)</span>
                  <span className="font-semibold">
                    - {formatCurrency(Math.floor(consumeResult.pointsUsed / (pointsRules?.exchangeRate || 100)) * 100)}
                  </span>
                </div>
              )}
              <div className="border-t border-primary-100 pt-3 mt-3 flex justify-between">
                <span className="text-primary-700 font-medium">实付金额</span>
                <span className="text-xl font-bold text-primary-800">
                  {formatCurrency(consumeResult.actualAmount)}
                </span>
              </div>
              <div className="flex justify-between text-accent-600 pt-2">
                <span>获得积分</span>
                <span className="font-semibold">+ {consumeResult.pointsEarned} 积分</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-primary-400">
            即将返回收银台...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-primary-800">消费收银</h2>
        <p className="text-primary-500 mt-1">选择会员和服务项目，完成消费结算</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">选择会员</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索会员姓名或手机号..."
                className="input-field pl-12"
              />
            </div>

            {selectedMember ? (
              <div className="p-4 bg-primary-50 rounded-xl border-2 border-primary-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-serif text-xl font-bold">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-800">{selectedMember.name}</h4>
                    <p className="text-sm text-primary-500">{formatPhone(selectedMember.phone)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-500">余额</p>
                    <p className="font-bold text-primary-800">{formatCurrency(selectedMember.balance)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="text-primary-400 hover:text-primary-600 text-sm"
                  >
                    更换
                  </button>
                </div>
              </div>
            ) : searchKeyword && filteredMembers.length > 0 ? (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-800">{member.name}</p>
                      <p className="text-sm text-primary-500">{formatPhone(member.phone)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-800">{formatCurrency(member.balance)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchKeyword ? (
              <div className="text-center py-8 text-primary-400">
                <User size={40} className="mx-auto mb-2 opacity-50" />
                <p>未找到匹配的会员</p>
              </div>
            ) : (
              <div className="text-center py-8 text-primary-400">
                <User size={40} className="mx-auto mb-2 opacity-50" />
                <p>输入会员姓名或手机号进行搜索</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">选择服务项目</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedService?.id === service.id}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card sticky top-24">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">结算信息</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                <span className="text-primary-600">会员</span>
                <span className="font-medium text-primary-800">
                  {selectedMember?.name || '未选择'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                <span className="text-primary-600">服务项目</span>
                <span className="font-medium text-primary-800">
                  {selectedService?.name || '未选择'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                <span className="text-primary-600">消费金额</span>
                <span className="text-xl font-bold text-primary-800">
                  {formatCurrency(originalAmount)}
                </span>
              </div>

              {selectedMember && memberCoupons.length > 0 && (
                <div className="pb-3 border-b border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary-600 flex items-center gap-1">
                      <Ticket size={16} className="text-accent-600" />
                      优惠券
                    </span>
                  </div>
                  <div className="space-y-2">
                    {memberCoupons.map((coupon) => (
                      <label
                        key={coupon.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCoupon?.id === coupon.id
                            ? 'border-accent-500 bg-accent-50'
                            : 'border-primary-100 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="coupon"
                          value={coupon.id}
                          checked={selectedCoupon?.id === coupon.id}
                          onChange={() => setSelectedCoupon(
                            selectedCoupon?.id === coupon.id ? null : coupon
                          )}
                          className="hidden"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary-800">{coupon.name}</p>
                          <p className="text-xs text-primary-500">
                            有效期至 {coupon.validTo}
                          </p>
                        </div>
                        <span className="font-bold text-accent-600">
                          -{formatCurrency(coupon.amount)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember && pointsRules && maxPointsToUse > 0 && (
                <div className="pb-3 border-b border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary-600 flex items-center gap-1">
                      <Gift size={16} className="text-purple-600" />
                      积分抵扣
                    </span>
                    <span className="text-xs text-primary-500">
                      可用 {maxPointsToUse} 分 · {pointsRules.exchangeRate}分=1元
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <button
                      onClick={() => handlePointsChange(-minPointsToUse)}
                      disabled={pointsToUse === 0}
                      className="w-8 h-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={14} className="text-purple-600" />
                    </button>
                    <div className="text-center">
                      <span className="font-bold text-purple-700 text-lg">{pointsToUse}</span>
                      <span className="text-purple-500 text-sm ml-1">分</span>
                      {pointsDiscount > 0 && (
                        <p className="text-xs text-purple-600">抵 {formatCurrency(pointsDiscount)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handlePointsChange(minPointsToUse)}
                      disabled={pointsToUse >= maxPointsToUse}
                      className="w-8 h-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} className="text-purple-600" />
                    </button>
                  </div>
                </div>
              )}

              {totalDiscount > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-primary-100 text-green-600">
                  <span>优惠合计</span>
                  <span className="font-bold">- {formatCurrency(totalDiscount)}</span>
                </div>
              )}

              {pointsRules && (
                <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                  <span className="text-primary-600 flex items-center gap-1">
                    <Gift size={16} className="text-accent-600" />
                    获得积分
                  </span>
                  <span className="font-semibold text-accent-600">
                    +{estimatedPoints} 积分
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-primary-700 mb-3">支付方式</p>
              <div className="space-y-2">
                <button
                  onClick={() => setPayMethod('balance')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    payMethod === 'balance'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-primary-100 bg-white hover:border-primary-300'
                  } ${!canPayWithBalance && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!canPayWithBalance}
                >
                  <Wallet size={20} className={payMethod === 'balance' ? 'text-primary-600' : 'text-primary-400'} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-primary-800">余额支付</p>
                    {selectedMember && (
                      <p className="text-xs text-primary-500">
                        可用余额: {formatCurrency(selectedMember.balance)}
                      </p>
                    )}
                  </div>
                  {payMethod === 'balance' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setPayMethod('cash')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    payMethod === 'cash'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-primary-100 bg-white hover:border-primary-300'
                  }`}
                >
                  <CreditCard size={20} className={payMethod === 'cash' ? 'text-primary-600' : 'text-primary-400'} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-primary-800">现金/扫码支付</p>
                    <p className="text-xs text-primary-500">不扣除会员余额</p>
                  </div>
                  {payMethod === 'cash' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-100">
              {totalDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-primary-500">原价</span>
                  <span className="text-primary-400 line-through">
                    {formatCurrency(originalAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-primary-800">实付金额</span>
                <span className="text-3xl font-bold text-primary-800">
                  {formatCurrency(actualAmount)}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedMember || !selectedService || (payMethod === 'balance' && !canPayWithBalance)}
                className="w-full btn-accent text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '确认收款'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
