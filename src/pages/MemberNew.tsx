import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import Toast from '../components/Toast.js';
import { formatCurrency } from '../utils/format.js';
import type { RechargeRule } from '../../shared/types/index.js';

export default function MemberNew() {
  const navigate = useNavigate();
  const { addMember, rechargeRules, fetchConfig, loading } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthday: '',
    balance: 0,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);

  const calculateBonus = (amount: number, rules: RechargeRule[]): number => {
    let bonus = 0;
    for (const rule of rules) {
      if (amount >= rule.minAmount) {
        bonus = rule.bonusAmount;
      }
    }
    return bonus;
  };

  const rechargeAmount = formData.balance;
  const bonusAmount = calculateBonus(rechargeAmount, rechargeRules);
  const totalBalance = rechargeAmount + bonusAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setToast({ message: '请输入会员姓名', type: 'error' });
      return;
    }
    if (!formData.phone.trim()) {
      setToast({ message: '请输入手机号码', type: 'error' });
      return;
    }

    try {
      await addMember({
        name: formData.name,
        phone: formData.phone,
        birthday: formData.birthday,
        balance: totalBalance,
        points: 0,
      });
      setToast({ message: '会员创建成功', type: 'success' });
      setTimeout(() => navigate('/members'), 1500);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/members" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={20} />
          返回列表
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">新增会员</h2>
          <p className="text-primary-500 mt-1">录入新会员信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
            <UserPlus size={28} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary-800">会员信息</h3>
            <p className="text-sm text-primary-500">请填写会员的基本信息</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              会员姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              手机号码 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号码"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              出生日期
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowRecharge(!showRecharge)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
            >
              <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-sm">
                {showRecharge ? '−' : '+'}
              </span>
              {showRecharge ? '收起' : '同时充值会员余额'}
            </button>
          </div>

          {showRecharge && (
            <div className="p-6 bg-accent-50 rounded-xl border-2 border-accent-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  充值金额（元）
                </label>
                <input
                  type="number"
                  value={rechargeAmount / 100 || ''}
                  onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) * 100 })}
                  placeholder="请输入充值金额"
                  className="input-field"
                  min="0"
                  step="100"
                />
              </div>

              {rechargeRules.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-primary-600 mb-2">充值规则：</p>
                  <div className="flex flex-wrap gap-2">
                    {rechargeRules.map((rule, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          rechargeAmount >= rule.minAmount
                            ? 'bg-accent-500 text-white'
                            : 'bg-white text-primary-600 border border-primary-200'
                        }`}
                      >
                        充{formatCurrency(rule.minAmount)}送{formatCurrency(rule.bonusAmount)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rechargeAmount > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-primary-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-primary-600">充值金额</span>
                    <span className="font-semibold text-primary-800">{formatCurrency(rechargeAmount)}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between mb-2 text-accent-600">
                      <span>赠送金额</span>
                      <span className="font-semibold">+ {formatCurrency(bonusAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-primary-100 pt-2 mt-2 flex justify-between">
                    <span className="text-primary-700 font-medium">实际到账</span>
                    <span className="text-xl font-bold text-primary-800">{formatCurrency(totalBalance)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-primary-100">
          <Link to="/members" className="btn-outline">
            取消
          </Link>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <Save size={18} />
            {loading ? '保存中...' : '保存会员'}
          </button>
        </div>
      </form>

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
