import { Router } from 'express';
import {
  getMembers,
  getMemberById,
  searchMembers,
  addMember,
  updateMember,
  getMembersWithUpcomingBirthdays,
} from '../services/memberService.js';
import { getConsumeRecordsByMemberId } from '../services/consumeService.js';
import { getRechargeRecordsByMemberId } from '../services/rechargeService.js';
import { getPointsExchangeRecordsByMemberId } from '../services/pointsService.js';
import { getBirthdayConfig } from '../services/configService.js';

const router = Router();

router.get('/', (req, res) => {
  const keyword = req.query.keyword as string;
  if (keyword) {
    const members = searchMembers(keyword);
    res.json(members);
  } else {
    const members = getMembers();
    res.json(members);
  }
});

router.get('/birthdays', (req, res) => {
  const birthdayConfig = getBirthdayConfig();
  const days = birthdayConfig.remindDays;
  const members = getMembersWithUpcomingBirthdays(days);
  res.json(members);
});

router.get('/:id', (req, res) => {
  const member = getMemberById(req.params.id);
  if (!member) {
    res.status(404).json({ error: '会员不存在' });
    return;
  }
  res.json(member);
});

router.get('/:id/records', (req, res) => {
  const memberId = req.params.id;
  const member = getMemberById(memberId);
  if (!member) {
    res.status(404).json({ error: '会员不存在' });
    return;
  }
  
  const consumeRecords = getConsumeRecordsByMemberId(memberId);
  const rechargeRecords = getRechargeRecordsByMemberId(memberId);
  const pointsRecords = getPointsExchangeRecordsByMemberId(memberId);
  
  res.json({
    member,
    consumeRecords,
    rechargeRecords,
    pointsRecords,
  });
});

router.post('/', (req, res) => {
  const { name, phone, birthday, balance = 0, points = 0 } = req.body;
  
  if (!name || !phone) {
    res.status(400).json({ error: '姓名和电话不能为空' });
    return;
  }
  
  const newMember = addMember({
    name,
    phone,
    birthday: birthday || '',
    balance,
    points,
  });
  
  res.status(201).json(newMember);
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const updated = updateMember(id, req.body);
  
  if (!updated) {
    res.status(404).json({ error: '会员不存在' });
    return;
  }
  
  res.json(updated);
});

export default router;
