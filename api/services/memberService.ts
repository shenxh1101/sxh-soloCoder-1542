import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate, getDaysUntilBirthday, calculateBonusAmount } from '../utils/format.js';
import type { Member, RechargeRule, RechargeRecord } from '../../shared/types/index.js';
import { getRechargeRecords, writeRechargeRecords } from './rechargeService.js';

export function getMembers(): Member[] {
  return readJSONFile<Member[]>('members.json');
}

export function getMemberById(id: string): Member | undefined {
  const members = getMembers();
  return members.find(m => m.id === id);
}

export function searchMembers(keyword: string): Member[] {
  const members = getMembers();
  if (!keyword) return members;
  const lowerKeyword = keyword.toLowerCase();
  return members.filter(m => 
    m.name.toLowerCase().includes(lowerKeyword) || 
    m.phone.includes(keyword)
  );
}

export function addMember(
  data: Omit<Member, 'id' | 'createdAt' | 'lastVisitAt'>,
  rechargeAmount: number = 0,
  rechargeRules: RechargeRule[] = []
): { member: Member; rechargeRecord?: RechargeRecord } {
  const members = getMembers();
  
  let bonusAmount = 0;
  let totalBalance = data.balance;
  let rechargeRecord: RechargeRecord | undefined;

  if (rechargeAmount > 0) {
    bonusAmount = calculateBonusAmount(rechargeAmount, rechargeRules);
    totalBalance = rechargeAmount + bonusAmount;

    rechargeRecord = {
      id: generateId('r'),
      memberId: '',
      memberName: data.name,
      memberPhone: data.phone,
      rechargeAmount,
      bonusAmount,
      balanceBefore: data.balance,
      balanceAfter: data.balance + totalBalance,
      pointsBefore: data.points,
      pointsAfter: data.points,
      createdAt: new Date().toISOString(),
    };
  }

  const newMember: Member = {
    ...data,
    balance: totalBalance,
    id: generateId('m'),
    createdAt: formatDate(new Date()),
    lastVisitAt: null,
  };

  if (rechargeRecord) {
    rechargeRecord.memberId = newMember.id;
    const rechargeRecords = getRechargeRecords();
    rechargeRecords.push(rechargeRecord);
    writeRechargeRecords(rechargeRecords);
  }

  members.push(newMember);
  writeJSONFile('members.json', members);
  
  return { member: newMember, rechargeRecord };
}

export function updateMember(id: string, data: Partial<Member>): Member | undefined {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return undefined;
  
  members[index] = { ...members[index], ...data };
  writeJSONFile('members.json', members);
  return members[index];
}

export function getMembersWithUpcomingBirthdays(days: number): (Member & { daysUntilBirthday: number })[] {
  const members = getMembers();
  return members
    .map(m => ({
      ...m,
      daysUntilBirthday: getDaysUntilBirthday(m.birthday),
    }))
    .filter(m => m.daysUntilBirthday <= days)
    .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
}
