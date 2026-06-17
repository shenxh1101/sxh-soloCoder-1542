import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate, calculateBonusAmount } from '../utils/format.js';
import { getMemberById, updateMember } from './memberService.js';
import type { RechargeRecord, RechargeRequest, RechargeRule } from '../../shared/types/index.js';

export function getRechargeRecords(): RechargeRecord[] {
  return readJSONFile<RechargeRecord[]>('rechargeRecords.json');
}

export function getRechargeRecordsByMemberId(memberId: string): RechargeRecord[] {
  const records = getRechargeRecords();
  return records.filter(r => r.memberId === memberId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createRecharge(
  data: RechargeRequest,
  rules: RechargeRule[]
): RechargeRecord | { error: string } {
  const member = getMemberById(data.memberId);
  if (!member) {
    return { error: '会员不存在' };
  }

  const bonusAmount = calculateBonusAmount(data.rechargeAmount, rules);
  const totalAmount = data.rechargeAmount + bonusAmount;

  const balanceBefore = member.balance;
  const pointsBefore = member.points;
  const newBalance = balanceBefore + totalAmount;

  const newRecord: RechargeRecord = {
    id: generateId('r'),
    memberId: data.memberId,
    memberName: member.name,
    memberPhone: member.phone,
    rechargeAmount: data.rechargeAmount,
    bonusAmount,
    balanceBefore,
    balanceAfter: newBalance,
    pointsBefore,
    pointsAfter: pointsBefore,
    createdAt: new Date().toISOString(),
  };

  const records = getRechargeRecords();
  records.push(newRecord);
  writeJSONFile('rechargeRecords.json', records);

  updateMember(member.id, {
    balance: newBalance,
  });

  return newRecord;
}

export function getBonusForAmount(amount: number, rules: RechargeRule[]): number {
  return calculateBonusAmount(amount, rules);
}

export function writeRechargeRecords(records: RechargeRecord[]): void {
  writeJSONFile('rechargeRecords.json', records);
}
