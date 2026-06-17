import { Router } from 'express';
import { getConsumeRecords, createConsume } from '../services/consumeService.js';
import { getPointsRules } from '../services/configService.js';

const router = Router();

router.get('/', (_req, res) => {
  const records = getConsumeRecords();
  res.json(records);
});

router.post('/', (req, res) => {
  const { memberId, serviceName, amount, payMethod, couponId, pointsUsed } = req.body;
  
  if (!memberId || !serviceName || !amount || !payMethod) {
    res.status(400).json({ error: '参数不完整' });
    return;
  }
  
  const pointsRules = getPointsRules();
  const result = createConsume(
    { memberId, serviceName, amount, payMethod, couponId, pointsUsed },
    pointsRules
  );
  
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.status(201).json(result);
});

export default router;
