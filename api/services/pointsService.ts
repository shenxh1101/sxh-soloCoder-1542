import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate } from '../utils/format.js';
import { getMemberById, updateMember } from './memberService.js';
import type { PointsExchange, PointsExchangeRequest, PointsRules } from '../../shared/types/index.js';

export function getPointsExchangeRecords(): PointsExchange[] {
  return readJSONFile<PointsExchange[]>('pointsExchange.json');
}

export function getPointsExchangeRecordsByMemberId(memberId: string): PointsExchange[] {
  const records = getPointsExchangeRecords();
  return records.filter(r => r.memberId === memberId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function exchangePoints(
  data: PointsExchangeRequest,
  pointsRules: PointsRules
): PointsExchange | { error: string } {
  const member = getMemberById(data.memberId);
  if (!member) {
    return { error: '会员不存在' };
  }

  if (member.points < data.pointsUsed) {
    return { error: '积分不足' };
  }

  if (data.pointsUsed < pointsRules.minPoints) {
    return { error: `积分不足最低兑换要求 ${pointsRules.minPoints} 分` };
  }

  let cashValue = 0;
  if (data.exchangeType === 'cash') {
    cashValue = Math.floor(data.pointsUsed / pointsRules.exchangeRate) * 100;
  }

  const newRecord: PointsExchange = {
    id: generateId('p'),
    memberId: data.memberId,
    pointsUsed: data.pointsUsed,
    exchangeType: data.exchangeType,
    cashValue,
    productName: data.productName || '',
    createdAt: formatDate(new Date()),
  };

  const records = getPointsExchangeRecords();
  records.push(newRecord);
  writeJSONFile('pointsExchange.json', records);

  const newBalance = data.exchangeType === 'cash' 
    ? member.balance + cashValue 
    : member.balance;

  updateMember(member.id, {
    points: member.points - data.pointsUsed,
    balance: newBalance,
  });

  return newRecord;
}
