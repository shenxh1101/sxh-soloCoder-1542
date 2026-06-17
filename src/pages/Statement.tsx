import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Wallet,
  CreditCard,
  TrendingUp,
  Ticket,
  Gift,
  Users,
  ShoppingBag,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { statisticsApi } from '../api/client.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import type { MonthlyStatement, ReconciliationState } from '../../shared/types/index.js';

export default function Statement() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statement, setStatement] = useState<MonthlyStatement | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationState | null>(null);
  const [actualCashYuan, setActualCashYuan] = useState('');
  const [actualRechargeYuan, setActualRechargeYuan] = useState('');
  const [notes, setNotes] = useState('');

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    loadStatement();
  }, [year, month]);

  useEffect(() => {
    if (reconciliation) {
      setActualCashYuan((reconciliation.actualCashAmount / 100).toFixed(2));
      setActualRechargeYuan((reconciliation.actualRechargeAmount / 100).toFixed(2));
      setNotes(reconciliation.notes);
    }
  }, [reconciliation]);

  const loadStatement = async () => {
    setLoading(true);
    try {
      const res = await statisticsApi.getStatement(year, month);
      setStatement(res.data.statement);
      setReconciliation(res.data.reconciliation);
    } catch (err) {
      console.error('Failed to load statement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleExportCsv = () => {
    const url = statisticsApi.getStatementCsvUrl(year, month);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-statement-${year}-${String(month).padStart(2, '0')}.csv`;
    link.click();
  };

  const handleSave = async (asReconciled: boolean = false) => {
    if (!reconciliation) return;
    setSaving(true);
    try {
      const cashFen = Math.round(parseFloat(actualCashYuan || '0') * 100);
      const rechargeFen = Math.round(parseFloat(actualRechargeYuan || '0') * 100);
      const res = await statisticsApi.saveReconciliation({
        month: monthStr,
        actualCashAmount: cashFen,
        actualRechargeAmount: rechargeFen,
        notes,
        reconciled: asReconciled,
      });
      setReconciliation(res.data);
    } catch (err) {
      console.error('Failed to save reconciliation:', err);
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = `${year}年${month}月`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!statement || !reconciliation) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500">暂无数据</p>
      </div>
    );
  }

  const actualCashFen = Math.round(parseFloat(actualCashYuan || '0') * 100);
  const actualRechargeFen = Math.round(parseFloat(actualRechargeYuan || '0') * 100);
  const cashDiff = actualCashFen - statement.cashIncome;
  const rechargeDiff = actualRechargeFen - statement.rechargeIncome;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/statistics" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={20} />
          返回统计
        </Link>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-primary-800">月底对账</h2>
            {reconciliation.reconciled ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm border-2 border-green-200">
                <CheckCircle2 size={14} />
                已对账
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm border-2 border-primary-100">
                <Circle size={14} />
                未对账
              </span>
            )}
          </div>
          <p className="text-primary-500 mt-1">按月汇总经营数据，支持导出对账</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-outline flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={handleExportCsv}
            className="btn-accent flex items-center gap-2"
          >
            <Download size={18} />
            导出CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-600 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary-800">对账月份</h3>
              <p className="text-sm text-primary-500">{monthLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-lg border-2 border-primary-200 flex items-center justify-center hover:bg-primary-50 text-primary-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-32 text-center font-semibold text-primary-800">
              {monthLabel}
            </div>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-lg border-2 border-primary-200 flex items-center justify-center hover:bg-primary-50 text-primary-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className="text-primary-600" />
              <span className="text-sm text-primary-600">总收入</span>
            </div>
            <p className="text-2xl font-bold text-primary-800">
              {formatCurrency(statement.totalIncome)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-green-600" />
              <span className="text-sm text-green-600">现金收入</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(statement.cashIncome)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span className="text-sm text-blue-600">会员卡充值</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(statement.rechargeIncome)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={18} className="text-pink-600" />
              <span className="text-sm text-pink-600">赠送金额</span>
            </div>
            <p className="text-2xl font-bold text-pink-800">
              {formatCurrency(statement.bonusAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-accent-50 rounded-xl border-2 border-accent-200">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className="text-accent-600" />
              <span className="text-sm text-accent-700">余额扣款</span>
            </div>
            <p className="text-xl font-bold text-accent-800">
              {formatCurrency(statement.balanceDeduction)}
            </p>
          </div>
          <div className="p-4 bg-accent-50/50 rounded-xl border-2 border-accent-100">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} className="text-primary-600" />
              <span className="text-sm text-primary-600">消费单数</span>
            </div>
            <p className="text-xl font-bold text-primary-800">
              {statement.consumeCount} 单
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-purple-600" />
              <span className="text-sm text-purple-600">新增会员</span>
            </div>
            <p className="text-xl font-bold text-purple-800">
              {statement.newMemberCount} 人
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Ticket size={18} className="text-pink-600" />
              <span className="text-sm text-pink-600">优惠合计</span>
            </div>
            <p className="text-xl font-bold text-pink-800">
              {formatCurrency(statement.totalDiscountAmount)}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-100 pt-6">
          <h4 className="font-semibold text-primary-800 mb-4">金额构成</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-primary-600">原价消费总额</span>
              <span className="font-medium text-primary-800">
                {formatCurrency(statement.originalConsumeAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-accent-600">
              <span className="flex items-center gap-2">
                <Ticket size={16} />
                优惠券抵扣
              </span>
              <span className="font-medium">- {formatCurrency(statement.couponDiscountAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-purple-600">
              <span className="flex items-center gap-2">
                <Gift size={16} />
                积分抵扣
              </span>
              <span className="font-medium">- {formatCurrency(statement.pointsDiscountAmount)}</span>
            </div>
            <div className="border-t border-primary-100 pt-3 mt-3 flex justify-between items-center">
              <span className="font-semibold text-primary-700">实际消费总额</span>
              <span className="font-bold text-primary-800 text-lg">
                {formatCurrency(statement.totalConsumeAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-600 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-semibold text-primary-800">门店对账录入</h3>
            <p className="text-sm text-primary-500">录入实际收款金额，与系统数据对比差异</p>
          </div>
          {reconciliation.reconciledAt && (
            <div className="text-right text-xs text-primary-500">
              <p>对账完成时间</p>
              <p className="font-medium text-primary-700">{formatDateTime(reconciliation.reconciledAt)}</p>
              {reconciliation.reconciledBy && (
                <p>操作人：{reconciliation.reconciledBy}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
            <label className="block text-sm font-medium text-green-800 mb-2">
              实际现金/扫码收款（元）
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={actualCashYuan}
              onChange={(e) => setActualCashYuan(e.target.value)}
              placeholder="输入实际收到的现金和扫码金额"
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 bg-white focus:border-green-500 focus:outline-none text-lg font-semibold text-green-800"
              disabled={reconciliation.reconciled}
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-primary-600">系统记录现金收入</span>
              <span className="font-medium text-primary-800">{formatCurrency(statement.cashIncome)}</span>
            </div>
            <div className={`mt-2 flex items-center justify-between text-sm ${cashDiff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span className="flex items-center gap-1">
                {cashDiff !== 0 && <AlertTriangle size={14} />}
                差异
              </span>
              <span className="font-semibold">
                {cashDiff >= 0 ? '+' : ''}{formatCurrency(cashDiff)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              实际充值收款（元）
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={actualRechargeYuan}
              onChange={(e) => setActualRechargeYuan(e.target.value)}
              placeholder="输入实际收到的会员充值款"
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white focus:border-blue-500 focus:outline-none text-lg font-semibold text-blue-800"
              disabled={reconciliation.reconciled}
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-primary-600">系统记录充值收入</span>
              <span className="font-medium text-primary-800">{formatCurrency(statement.rechargeIncome)}</span>
            </div>
            <div className={`mt-2 flex items-center justify-between text-sm ${rechargeDiff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span className="flex items-center gap-1">
                {rechargeDiff !== 0 && <AlertTriangle size={14} />}
                差异
              </span>
              <span className="font-semibold">
                {rechargeDiff >= 0 ? '+' : ''}{formatCurrency(rechargeDiff)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            备注（差异原因、说明等）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="如有差异，可在这里备注原因"
            className="w-full px-4 py-3 rounded-xl border-2 border-primary-200 focus:border-primary-500 focus:outline-none text-primary-800 resize-none"
            disabled={reconciliation.reconciled}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-100">
          {reconciliation.reconciled ? (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn-outline flex items-center gap-2"
            >
              <Save size={18} />
              取消对账并编辑
            </button>
          ) : (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="btn-outline flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? '保存中...' : '保存草稿'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                {saving ? '提交中...' : '确认对账无误'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-600 flex items-center justify-center">
            <Ticket size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-primary-800">营销统计（{monthLabel}）</h3>
            <p className="text-sm text-primary-500">按实际发生日期汇总</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
            <p className="text-sm text-pink-600 mb-1">本月发券</p>
            <p className="text-2xl font-bold text-pink-700">
              {statement.marketing.couponsIssued} 张
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-600 mb-1">本月用券</p>
            <p className="text-2xl font-bold text-green-700">
              {statement.marketing.couponsUsed} 张
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">已过期</p>
            <p className="text-2xl font-bold text-gray-700">
              {statement.marketing.couponsExpired} 张
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-purple-600 mb-1">累计抵扣</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(statement.marketing.totalDiscountAmount)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-primary-100">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-primary-600">优惠券抵扣</span>
              <span className="font-medium text-primary-800">
                {formatCurrency(statement.marketing.couponDiscountAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary-600">积分抵扣</span>
              <span className="font-medium text-primary-800">
                {formatCurrency(statement.marketing.pointsDiscountAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
