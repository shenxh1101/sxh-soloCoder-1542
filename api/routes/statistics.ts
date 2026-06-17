import { Router } from 'express';
import { getStatistics, getDailyTrend } from '../services/statisticsService.js';

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

export default router;
