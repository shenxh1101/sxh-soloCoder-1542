export function formatDate(date: Date): string {
  return date.toISOString();
}

export function calculateBonusAmount(amount: number, rules: { minAmount: number; bonusAmount: number }[]): number {
  let bonus = 0;
  for (const rule of rules) {
    if (amount >= rule.minAmount) {
      bonus = rule.bonusAmount;
    }
  }
  return bonus;
}

export function calculatePoints(amount: number, pointsPerYuan: number): number {
  return Math.floor(amount / 100 * pointsPerYuan);
}

export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  
  let targetDate = thisYearBirthday;
  if (thisYearBirthday < today) {
    targetDate = nextYearBirthday;
  }
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameWeek(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const day1 = d1.getDay();
  const diff1 = d1.getDate() - day1 + (day1 === 0 ? -6 : 1);
  const monday1 = new Date(d1.setDate(diff1));
  
  const day2 = d2.getDay();
  const diff2 = d2.getDate() - day2 + (day2 === 0 ? -6 : 1);
  const monday2 = new Date(d2.setDate(diff2));
  
  return monday1.getTime() === monday2.getTime();
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
