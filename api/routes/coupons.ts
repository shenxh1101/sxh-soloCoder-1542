import { Router } from 'express';
import {
  getCoupons,
  getCouponById,
  getCouponsByMemberId,
  getUnusedCouponsByMemberId,
  createCoupon,
  useCoupon,
  checkAndUpdateExpiredCoupons,
} from '../services/couponService.js';

const router = Router();

router.get('/', (req, res) => {
  checkAndUpdateExpiredCoupons();
  const coupons = getCoupons();
  res.json(coupons);
});

router.get('/member/:memberId', (req, res) => {
  checkAndUpdateExpiredCoupons();
  const coupons = getCouponsByMemberId(req.params.memberId);
  res.json(coupons);
});

router.get('/member/:memberId/unused', (req, res) => {
  checkAndUpdateExpiredCoupons();
  const coupons = getUnusedCouponsByMemberId(req.params.memberId);
  res.json(coupons);
});

router.get('/:id', (req, res) => {
  checkAndUpdateExpiredCoupons();
  const coupon = getCouponById(req.params.id);
  if (!coupon) {
    res.status(404).json({ error: '优惠券不存在' });
    return;
  }
  res.json(coupon);
});

router.post('/', (req, res) => {
  const { memberId, name, amount, type, validDays } = req.body;

  if (!memberId || !name || !amount || !type) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ error: '优惠券金额必须大于0' });
    return;
  }

  const result = createCoupon({
    memberId,
    name,
    amount,
    type,
    validDays,
  });

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json(result);
});

router.post('/:id/use', (req, res) => {
  const { recordId } = req.body;

  if (!recordId) {
    res.status(400).json({ error: '缺少消费记录ID' });
    return;
  }

  const result = useCoupon(req.params.id, recordId);

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json(result);
});

export default router;
