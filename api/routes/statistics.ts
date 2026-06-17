import { Router } from 'express';
import { getStatistics, getDailyTrend, getMonthlyStatement } from '../services/statisticsService.js';
import { getConsumeRecords } from '../services/consumeService.js';
import { getRechargeRecords } from '../services/rechargeService.js';
import { isSameMonth } from '../utils/format.js';

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
  res.json(statement);
});

router.get('/statement/csv', (req, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
  const statement = getMonthlyStatement(year, month);
  
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
  lines.push('消费明细');
  lines.push('时间,服务项目,原价,实付,支付方式,优惠券抵扣,积分抵扣,积分获得');
  
  for (const record of monthConsumes) {
    lines.push([
      record.createdAt.replace('T', ' ').split('.')[0],
      record.serviceName,
      (record.originalAmount / 100).toFixed(2),
      (record.amount / 100).toFixed(2),
      record.payMethod === 'cash' ? '现金' : '余额',
      (record.couponDiscount / 100).toFixed(2),
      (record.pointsDiscount / 100).toFixed(2),
      record.pointsEarned,
    ].join(','));
  }
  
  lines.push('');
  lines.push('充值明细');
  lines.push('时间,充值金额,赠送金额,实际到账');
  
  for (const record of monthRecharges) {
    lines.push([
      record.createdAt.replace('T', ' ').split('.')[0],
      (record.rechargeAmount / 100).toFixed(2),
      (record.bonusAmount / 100).toFixed(2),
      ((record.rechargeAmount + record.bonusAmount) / 100).toFixed(2),
    ].join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-statement-${statement.month}.csv"`);
  res.send(csvContent);
});

export default router;
