import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Wallet, Gift, TrendingUp, CheckCircle, Settings } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import Toast from '../components/Toast.js';
import { formatCurrency, formatPhone } from '../utils/format.js';
import type { Member, RechargeRule } from '../../shared/types/index.js';

export default function Recharge() {
  const { members, rechargeRules, fetchMembers, fetchConfig, recharge, loading } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBonus, setLastBonus] = useState(0);
  const [lastRechargeAmount, setLastRechargeAmount] = useState(0);

  useEffect(() => {
    fetchMembers();
    fetchConfig();
  }, [fetchMembers, fetchConfig]);

  const selectedMember = useMemo(
    () => selectedMemberId ? members.find(m => m.id === selectedMemberId) ?? null : null,
    [selectedMemberId, members]
  );

  const filteredMembers = members.filter(m =>
    m.name.includes(searchKeyword) || m.phone.includes(searchKeyword)
  ).slice(0, 5);

  const calculateBonus = (amount: number, rules: RechargeRule[]): number => {
    let bonus = 0;
    for (const rule of rules) {
      if (amount >= rule.minAmount) {
        bonus = rule.bonusAmount;
      }
    }
    return bonus;
  };

  const bonusAmount = calculateBonus(rechargeAmount, rechargeRules);
  const totalAmount = rechargeAmount + bonusAmount;

  const handleQuickAmount = (amount: number) => {
    setRechargeAmount(amount);
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      setToast({ message: '请选择会员', type: 'error' });
      return;
    }
    if (rechargeAmount <= 0) {
      setToast({ message: '请输入充值金额', type: 'error' });
      return;
    }

    try {
      await recharge({
        memberId: selectedMember.id,
        rechargeAmount,
      });
      setLastBonus(bonusAmount);
      setLastRechargeAmount(rechargeAmount);
      setShowSuccess(true);
      setToast({ message: '充值成功！', type: 'success' });
      
      setTimeout(() => {
        setShowSuccess(false);
        setRechargeAmount(0);
      }, 2000);
    } catch (err) {
      console.error('Failed to recharge:', err);
    }
  };

  if (showSuccess && selectedMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary-800 mb-2">充值成功</h2>
          <p className="text-primary-500">
            {selectedMember.name} 充值 {formatCurrency(lastRechargeAmount)}
          </p>
          {lastBonus > 0 && (
            <p className="text-accent-600 mt-1">
              赠送 {formatCurrency(lastBonus)}
            </p>
          )}
          <p className="text-lg font-bold text-primary-800 mt-2">
            实际到账: {formatCurrency(lastRechargeAmount + lastBonus)}
          </p>
          <p className="text-sm text-green-600 mt-3">
            当前余额: {formatCurrency(selectedMember.balance)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">会员充值</h2>
          <p className="text-primary-500 mt-1">为会员充值余额，享受赠送优惠</p>
        </div>
        <Link to="/recharge/rules" className="btn-outline flex items-center gap-2">
          <Settings size={18} />
          充值规则
        </Link>
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
                    <p className="text-xs text-primary-500">当前余额</p>
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
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">充值规则</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rechargeRules.map((rule, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAmount(rule.minAmount)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    rechargeAmount === rule.minAmount
                      ? 'border-accent-500 bg-accent-50 shadow-md'
                      : 'border-primary-100 bg-white hover:border-accent-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gift size={16} className={rechargeAmount === rule.minAmount ? 'text-accent-600' : 'text-primary-400'} />
                    <span className={`text-sm ${rechargeAmount === rule.minAmount ? 'text-accent-600 font-medium' : 'text-primary-500'}`}>
                      赠送{formatCurrency(rule.bonusAmount)}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${rechargeAmount === rule.minAmount ? 'text-accent-600' : 'text-primary-800'}`}>
                    {formatCurrency(rule.minAmount)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card sticky top-24">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">充值信息</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  充值金额（元）
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 text-xl font-medium">¥</span>
                  <input
                    type="number"
                    value={rechargeAmount / 100 || ''}
                    onChange={(e) => setRechargeAmount(Number(e.target.value) * 100)}
                    placeholder="0.00"
                    className="input-field pl-10 text-xl font-semibold"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              {rechargeAmount > 0 && (
                <div className="p-4 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border-2 border-accent-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-primary-600">充值金额</span>
                    <span className="font-semibold text-primary-800">{formatCurrency(rechargeAmount)}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-accent-600 flex items-center gap-1">
                        <Gift size={16} />
                        赠送金额
                      </span>
                      <span className="font-semibold text-accent-600">+ {formatCurrency(bonusAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-primary-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-primary-700 font-medium">实际到账</span>
                      <span className="text-2xl font-bold text-primary-800">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedMember && (
              <div className="p-4 bg-primary-50 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-sm text-primary-600">充值后余额</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedMember.balance + totalAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-primary-100">
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedMember || rechargeAmount <= 0}
                className="w-full btn-accent text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wallet size={20} />
                {loading ? '处理中...' : '确认充值'}
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
