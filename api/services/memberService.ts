import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import { formatDate, getDaysUntilBirthday } from '../utils/format.js';
import type { Member } from '../../shared/types/index.js';

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

export function addMember(data: Omit<Member, 'id' | 'createdAt' | 'lastVisitAt'>): Member {
  const members = getMembers();
  const newMember: Member = {
    ...data,
    id: generateId('m'),
    createdAt: formatDate(new Date()),
    lastVisitAt: null,
  };
  members.push(newMember);
  writeJSONFile('members.json', members);
  return newMember;
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
