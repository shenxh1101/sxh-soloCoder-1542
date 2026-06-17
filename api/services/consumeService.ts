import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate, calculatePoints } from '../utils/format.js';
import { getMemberById, updateMember } from './memberService.js';
import type { ConsumeRecord, ConsumeRequest, PointsRules } from '../../shared/types/index.js';

export function getConsumeRecords(): ConsumeRecord[] {
  return readJSONFile<ConsumeRecord[]>('consumeRecords.json');
}

export function getConsumeRecordsByMemberId(memberId: string): ConsumeRecord[] {
  const records = getConsumeRecords();
  return records.filter(r => r.memberId === memberId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createConsume(
  data: ConsumeRequest,
  pointsRules: PointsRules
): ConsumeRecord | { error: string } {
  const member = getMemberById(data.memberId);
  if (!member) {
    return { error: '会员不存在' };
  }

  if (data.payMethod === 'balance' && member.balance < data.amount) {
    return { error: '余额不足' };
  }

  const pointsEarned = calculatePoints(data.amount, pointsRules.pointsPerYuan);

  const newRecord: ConsumeRecord = {
    id: generateId('c'),
    memberId: data.memberId,
    serviceName: data.serviceName,
    amount: data.amount,
    payMethod: data.payMethod,
    pointsEarned,
    createdAt: formatDate(new Date()),
  };

  const records = getConsumeRecords();
  records.push(newRecord);
  writeJSONFile('consumeRecords.json', records);

  const newBalance = data.payMethod === 'balance' ? member.balance - data.amount : member.balance;
  updateMember(member.id, {
    balance: newBalance,
    points: member.points + pointsEarned,
    lastVisitAt: newRecord.createdAt,
  });

  return newRecord;
}
