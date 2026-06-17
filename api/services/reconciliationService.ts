import { readJSONFile, writeJSONFile, generateId } from '../utils/file.js';
import type { ReconciliationState } from '../../shared/types/index.js';

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getAllReconciliationStates(): ReconciliationState[] {
  return readJSONFile<ReconciliationState[]>('reconciliationStates.json', []);
}

export function getReconciliationState(year: number, month: number): ReconciliationState {
  const states = getAllReconciliationStates();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const found = states.find(s => s.month === monthStr);
  if (found) return found;

  const now = new Date().toISOString();
  return {
    month: monthStr,
    actualCashAmount: 0,
    actualRechargeAmount: 0,
    notes: '',
    reconciled: false,
    reconciledAt: null,
    reconciledBy: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function saveReconciliationState(data: {
  month: string;
  actualCashAmount: number;
  actualRechargeAmount: number;
  notes: string;
  reconciled?: boolean;
}): ReconciliationState {
  const states = getAllReconciliationStates();
  const now = new Date().toISOString();
  const idx = states.findIndex(s => s.month === data.month);

  if (idx >= 0) {
    states[idx] = {
      ...states[idx],
      actualCashAmount: data.actualCashAmount,
      actualRechargeAmount: data.actualRechargeAmount,
      notes: data.notes,
      reconciled: data.reconciled !== undefined ? data.reconciled : states[idx].reconciled,
      reconciledAt: data.reconciled && !states[idx].reconciled ? now : states[idx].reconciledAt,
      reconciledBy: data.reconciled && !states[idx].reconciled ? '店主' : states[idx].reconciledBy,
      updatedAt: now,
    };
    writeJSONFile('reconciliationStates.json', states);
    return states[idx];
  }

  const newState: ReconciliationState = {
    month: data.month,
    actualCashAmount: data.actualCashAmount,
    actualRechargeAmount: data.actualRechargeAmount,
    notes: data.notes,
    reconciled: data.reconciled || false,
    reconciledAt: data.reconciled ? now : null,
    reconciledBy: data.reconciled ? '店主' : null,
    createdAt: now,
    updatedAt: now,
  };
  states.push(newState);
  writeJSONFile('reconciliationStates.json', states);
  return newState;
}

export function markReconciled(month: string, reconciled: boolean): ReconciliationState | null {
  const states = getAllReconciliationStates();
  const idx = states.findIndex(s => s.month === month);
  if (idx < 0) return null;

  const now = new Date().toISOString();
  states[idx] = {
    ...states[idx],
    reconciled,
    reconciledAt: reconciled ? now : null,
    reconciledBy: reconciled ? '店主' : null,
    updatedAt: now,
  };
  writeJSONFile('reconciliationStates.json', states);
  return states[idx];
}
