import { Router } from 'express';
import { getPointsExchangeRecords, exchangePoints } from '../services/pointsService.js';
import { getPointsRules } from '../services/configService.js';

const router = Router();

router.get('/', (_req, res) => {
  const records = getPointsExchangeRecords();
  res.json(records);
});

router.post('/exchange', (req, res) => {
  const { memberId, pointsUsed, exchangeType, productName } = req.body;
  
  if (!memberId || !pointsUsed || !exchangeType) {
    res.status(400).json({ error: '参数不完整' });
    return;
  }
  
  if (exchangeType === 'product' && !productName) {
    res.status(400).json({ error: '兑换商品时需要填写商品名称' });
    return;
  }
  
  const pointsRules = getPointsRules();
  const result = exchangePoints(
    { memberId, pointsUsed, exchangeType, productName },
    pointsRules
  );
  
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.status(201).json(result);
});

export default router;
