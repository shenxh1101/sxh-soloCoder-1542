import { Router } from 'express';
import { getStatistics, getDailyTrend, getMonthlyStatement, getMemberLedger } from '../services/statisticsService.js';
import { getConsumeRecords } from '../services/consumeService.js';
import { getRechargeRecords } from '../services/rechargeService.js';
import { isSameMonth } from '../utils/format.js';
import { getReconciliationState, saveReconciliationState } from '../services/reconciliationService.js';
import type { ReconciliationState } from '../../shared/types/index.js';

const router = Router();

router.get('/daily', (_req, res) => {
  const stats = getStatistics('daily');
  res.json(stats);
});

router.get('/weekly', (_req, res) => {
  const stats = getStatistics('weekly');
  res.json(stats);
});

router.get('/monthly', (_req, res) => {
  const stats = getStatistics('monthly');
  res.json(stats);
});

router.get('/trend', (req, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const trend = getDailyTrend(days);
  res.json(trend);
});

router.get('/statement', (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
  const statement = getMonthlyStatement(year, month);
  const reconciliation = getReconciliationState(year, month);
  res.json({ statement, reconciliation });
});

router.get('/statement/csv', (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
  const statement = getMonthlyStatement(year, month);
  const reconciliation = getReconciliationState(year, month);
  
  const targetDate = new Date(year, month - 1, 15);
  const allConsumes = getConsumeRecords();
  const allRecharges = getRechargeRecords();
  
  const monthConsumes = allConsumes.filter(r =>
    isSameMonth(new Date(r.createdAt), targetDate)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const monthRecharges = allRecharges.filter(r =>
    isSameMonth(new Date(r.createdAt), targetDate)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const lines: string[] = [];
  lines.push(`理发店月度对账单 - ${statement.month}`);
  lines.push('');
  lines.push('汇总信息');
  lines.push(`总收入,${(statement.totalIncome / 100).toFixed(2)}元`);
  lines.push(`现金收入,${(statement.cashIncome / 100).toFixed(2)}元`);
  lines.push(`会员卡充值,${(statement.rechargeIncome / 100).toFixed(2)}元`);
  lines.push(`赠送金额,${(statement.bonusAmount / 100).toFixed(2)}元`);
  lines.push(`余额扣款,${(statement.balanceDeduction / 100).toFixed(2)}元`);
  lines.push(`优惠券抵扣,${(statement.couponDiscountAmount / 100).toFixed(2)}元`);
  lines.push(`积分抵扣,${(statement.pointsDiscountAmount / 100).toFixed(2)}元`);
  lines.push(`优惠合计,${(statement.totalDiscountAmount / 100).toFixed(2)}元`);
  lines.push(`消费单数,${statement.consumeCount}单`);
  lines.push(`新增会员,${statement.newMemberCount}人`);
  lines.push('');
  lines.push('门店录入数据（实际收款）');
  lines.push(`实际现金收款,${(reconciliation.actualCashAmount / 100).toFixed(2)}元`);
  lines.push(`实际充值收款,${(reconciliation.actualRechargeAmount / 100).toFixed(2)}元`);
  lines.push(`现金差异,${((reconciliation.actualCashAmount - statement.cashIncome) / 100).toFixed(2)}元`);
  lines.push(`充值差异,${((reconciliation.actualRechargeAmount - statement.rechargeIncome) / 100).toFixed(2)}元`);
  lines.push(`对账状态,${reconciliation.reconciled ? '已对账' : '未对账'}`);
  if (reconciliation.notes) lines.push(`备注,${reconciliation.notes}`);
  lines.push('');
  lines.push('消费明细');
  lines.push('时间,会员姓名,会员手机号,服务项目,原价,优惠券抵扣,积分抵扣,实付,支付方式,获得积分,余额扣前,余额扣后,积分扣前,积分扣后,优惠来源');
  
  for (const record of monthConsumes) {
    const sources: string[] = [];
    if (record.couponDiscount > 0) sources.push(record.couponName || '优惠券');
    if (record.pointsDiscount > 0) sources.push('积分抵扣');
    const sourceStr = sources.length > 0 ? sources.join('+') : '无';
    
    lines.push([
      record.createdAt.replace('T', ' ').split('.')[0],
      record.memberName || '',
      record.memberPhone || '',
      record.serviceName,
      (record.originalAmount / 100).toFixed(2),
      (record.couponDiscount / 100).toFixed(2),
      (record.pointsDiscount / 100).toFixed(2),
      (record.amount / 100).toFixed(2),
      record.payMethod === 'cash' ? '现金' : '余额',
      record.pointsEarned,
      ((record.balanceBefore ?? 0) / 100).toFixed(2),
      ((record.balanceAfter ?? 0) / 100).toFixed(2),
      record.pointsBefore ?? 0,
      record.pointsAfter ?? 0,
      sourceStr,
    ].join(','));
  }
  
  lines.push('');
  lines.push('充值明细');
  lines.push('时间,会员姓名,会员手机号,充值金额,赠送金额,实际到账,余额扣前,余额扣后');
  
  for (const record of monthRecharges) {
    lines.push([
      record.createdAt.replace('T', ' ').split('.')[0],
      record.memberName || '',
      record.memberPhone || '',
      (record.rechargeAmount / 100).toFixed(2),
      (record.bonusAmount / 100).toFixed(2),
      ((record.rechargeAmount + record.bonusAmount) / 100).toFixed(2),
      ((record.balanceBefore ?? 0) / 100).toFixed(2),
      ((record.balanceAfter ?? 0) / 100).toFixed(2),
    ].join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-statement-${statement.month}.csv"`);
  res.send(csvContent);
});

router.get('/reconciliation', (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
  const state = getReconciliationState(year, month);
  res.json(state);
});

router.post('/reconciliation', (req, res) => {
  const body = req.body as Partial<ReconciliationState> & { month?: string };
  if (!body.month) {
    return res.status(400).json({ error: '缺少月份参数' });
  }
  const saved = saveReconciliationState({
    month: body.month,
    actualCashAmount: body.actualCashAmount ?? 0,
    actualRechargeAmount: body.actualRechargeAmount ?? 0,
    notes: body.notes ?? '',
    reconciled: body.reconciled,
  });
  res.json(saved);
});

router.get('/ledger/:memberId', (req, res) => {
  const { memberId } = req.params;
  const ledger = getMemberLedger(memberId);
  res.json(ledger);
});

export default router;
