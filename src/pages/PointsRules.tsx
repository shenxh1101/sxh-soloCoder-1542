import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Gift, Coins } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import Toast from '../components/Toast.js';
import type { PointsRules } from '../../shared/types/index.js';

export default function PointsRules() {
  const { pointsRules, fetchConfig, updatePointsRules, loading } = useAppStore();
  const [rules, setRules] = useState<PointsRules | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (pointsRules) {
      setRules({ ...pointsRules });
    }
  }, [pointsRules]);

  const handleChange = (field: keyof PointsRules, value: number) => {
    if (rules) {
      setRules({ ...rules, [field]: value });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!rules) return;
    
    if (rules.pointsPerYuan <= 0) {
      setToast({ message: '消费积分比例必须大于0', type: 'error' });
      return;
    }
    if (rules.exchangeRate <= 0) {
      setToast({ message: '兑换比例必须大于0', type: 'error' });
      return;
    }
    if (rules.minPoints < 0) {
      setToast({ message: '最低兑换积分不能为负数', type: 'error' });
      return;
    }

    try {
      await updatePointsRules(rules);
      setIsEditing(false);
      setToast({ message: '积分规则保存成功', type: 'success' });
    } catch (err) {
      console.error('Failed to save rules:', err);
    }
  };

  if (!rules) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/points" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={20} />
          返回积分管理
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">积分规则设置</h2>
          <p className="text-primary-500 mt-1">设置积分获取和兑换规则</p>
        </div>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Coins size={20} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary-800">积分规则配置</h3>
            <p className="text-sm text-primary-500">设置后即时生效</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-gradient-to-br from-green-50 to-accent-50 rounded-2xl border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-green-600" />
              <h4 className="font-semibold text-primary-800">获取规则</h4>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  消费金额
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium">¥</span>
                  <input
                    type="number"
                    value={1}
                    readOnly
                    className="input-field pl-8 bg-white/50"
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-primary-600 pb-3">=</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  获得积分
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rules.pointsPerYuan}
                    onChange={(e) => handleChange('pointsPerYuan', Number(e.target.value))}
                    className="input-field pr-10"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium">分</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-primary-500 mt-3">
              即会员每消费 1 元可获得 {rules.pointsPerYuan} 积分
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Coins size={18} className="text-blue-600" />
              <h4 className="font-semibold text-primary-800">兑换规则</h4>
            </div>
            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    积分数量
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rules.exchangeRate}
                      onChange={(e) => handleChange('exchangeRate', Number(e.target.value))}
                      className="input-field pr-10"
                      min="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium">分</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary-600 pb-3">=</span>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    可兑换金额
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium">¥</span>
                    <input
                      type="number"
                      value={1}
                      readOnly
                      className="input-field pl-8 bg-white/50"
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-primary-500">
                即 {rules.exchangeRate} 积分可兑换 1 元余额
              </p>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  最低兑换积分
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rules.minPoints}
                    onChange={(e) => handleChange('minPoints', Number(e.target.value))}
                    className="input-field pr-10"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium">分</span>
                </div>
                <p className="text-xs text-primary-500 mt-1">
                  积分少于此数量时不允许兑换
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-primary-100">
          <Link to="/points" className="btn-outline">
            取消
          </Link>
          <button
            onClick={handleSave}
            disabled={loading || !isEditing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? '保存中...' : '保存规则'}
          </button>
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
