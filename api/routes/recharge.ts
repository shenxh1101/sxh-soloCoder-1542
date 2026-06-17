import { Router } from 'express';
import { getRechargeRecords, createRecharge, getBonusForAmount } from '../services/rechargeService.js';
import { getRechargeRules } from '../services/configService.js';

const router = Router();

router.get('/', (_req, res) => {
  const records = getRechargeRecords();
  res.json(records);
});

router.get('/bonus/:amount', (req, res) => {
  const amount = parseInt(req.params.amount);
  const rules = getRechargeRules();
  const bonus = getBonusForAmount(amount, rules);
  res.json({ bonus });
});

router.post('/', (req, res) => {
  const { memberId, rechargeAmount } = req.body;
  
  if (!memberId || !rechargeAmount) {
    res.status(400).json({ error: '参数不完整' });
    return;
  }
  
  const rules = getRechargeRules();
  const result = createRecharge({ memberId, rechargeAmount }, rules);
  
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.status(201).json(result);
});

export default router;
