import { Router } from 'express';
import {
  getRechargeRules,
  updateRechargeRules,
  getPointsRules,
  updatePointsRules,
  getServices,
  updateServices,
  getBirthdayConfig,
  updateBirthdayConfig,
} from '../services/configService.js';

const router = Router();

router.get('/recharge-rules', (_req, res) => {
  const rules = getRechargeRules();
  res.json(rules);
});

router.put('/recharge-rules', (req, res) => {
  const rules = req.body;
  if (!Array.isArray(rules)) {
    res.status(400).json({ error: '规则格式错误' });
    return;
  }
  const updated = updateRechargeRules(rules);
  res.json(updated);
});

router.get('/points-rules', (_req, res) => {
  const rules = getPointsRules();
  res.json(rules);
});

router.put('/points-rules', (req, res) => {
  const rules = req.body;
  const updated = updatePointsRules(rules);
  res.json(updated);
});

router.get('/services', (_req, res) => {
  const services = getServices();
  res.json(services);
});

router.put('/services', (req, res) => {
  const services = req.body;
  if (!Array.isArray(services)) {
    res.status(400).json({ error: '服务列表格式错误' });
    return;
  }
  const updated = updateServices(services);
  res.json(updated);
});

router.get('/birthday-config', (_req, res) => {
  const config = getBirthdayConfig();
  res.json(config);
});

router.put('/birthday-config', (req, res) => {
  const config = req.body;
  const updated = updateBirthdayConfig(config);
  res.json(updated);
});

export default router;
