import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Gift } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import Toast from '../components/Toast.js';
import { formatCurrency } from '../utils/format.js';
import type { RechargeRule } from '../../shared/types/index.js';

export default function RechargeRules() {
  const { rechargeRules, fetchConfig, updateRechargeRules, loading } = useAppStore();
  const [rules, setRules] = useState<RechargeRule[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (rechargeRules.length > 0) {
      setRules([...rechargeRules]);
    }
  }, [rechargeRules]);

  const handleAddRule = () => {
    setRules([...rules, { minAmount: 0, bonusAmount: 0 }]);
    setIsEditing(true);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    setIsEditing(true);
  };

  const handleRuleChange = (index: number, field: 'minAmount' | 'bonusAmount', value: number) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const validRules = rules.filter(r => r.minAmount > 0 && r.bonusAmount > 0);
    if (validRules.length === 0) {
      setToast({ message: '请至少设置一条有效的充值规则', type: 'error' });
      return;
    }

    try {
      await updateRechargeRules(validRules);
      setIsEditing(false);
      setToast({ message: '充值规则保存成功', type: 'success' });
    } catch (err) {
      console.error('Failed to save rules:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/recharge" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={20} />
          返回充值
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">充值规则设置</h2>
          <p className="text-primary-500 mt-1">设置充值赠送规则，充越多送越多</p>
        </div>
      </div>

      <div className="card max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <Gift size={20} className="text-accent-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-primary-800">充值规则列表</h3>
              <p className="text-sm text-primary-500">金额单位：元，系统会自动匹配最高档规则</p>
            </div>
          </div>
          <button
            onClick={handleAddRule}
            className="btn-outline flex items-center gap-2"
          >
            <Plus size={18} />
            添加规则
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {rules.length === 0 ? (
            <div className="text-center py-12 text-primary-400">
              <Gift size={48} className="mx-auto mb-3 opacity-50" />
              <p>暂无充值规则</p>
              <p className="text-sm">点击上方按钮添加第一条规则</p>
            </div>
          ) : (
            rules.map((rule, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border-2 border-accent-200 flex items-center gap-4"
              >
                <span className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-primary-500 mb-1">充值满（元）</label>
                    <input
                      type="number"
                      value={rule.minAmount / 100}
                      onChange={(e) => handleRuleChange(index, 'minAmount', Number(e.target.value) * 100)}
                      className="input-field py-2"
                      min="0"
                    />
                  </div>
                  <span className="text-accent-600 font-bold text-xl">→</span>
                  <div className="flex-1">
                    <label className="block text-xs text-primary-500 mb-1">赠送（元）</label>
                    <input
                      type="number"
                      value={rule.bonusAmount / 100}
                      onChange={(e) => handleRuleChange(index, 'bonusAmount', Number(e.target.value) * 100)}
                      className="input-field py-2"
                      min="0"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-500">相当于</p>
                  <p className="font-bold text-accent-600">
                    {rule.minAmount > 0 ? Math.round(rule.minAmount / (rule.minAmount + rule.bonusAmount) * 100) : 0}折
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveRule(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {rules.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">规则预览</h4>
            <div className="flex flex-wrap gap-2">
              {rules
                .sort((a, b) => a.minAmount - b.minAmount)
                .map((rule, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-full text-sm text-primary-700 border border-blue-200"
                  >
                    充{formatCurrency(rule.minAmount)}送{formatCurrency(rule.bonusAmount)}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-primary-100">
          <Link to="/recharge" className="btn-outline">
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
