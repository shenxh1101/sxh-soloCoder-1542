import { readJSONFile, writeJSONFile } from '../utils/file.js';
import type { SystemConfig, RechargeRule, PointsRules, ServiceItem, BirthdayConfig } from '../../shared/types/index.js';

export function getConfig(): SystemConfig {
  return readJSONFile<SystemConfig>('config.json');
}

export function getRechargeRules(): RechargeRule[] {
  const config = getConfig();
  return config.rechargeRules.sort((a, b) => a.minAmount - b.minAmount);
}

export function updateRechargeRules(rules: RechargeRule[]): RechargeRule[] {
  const config = getConfig();
  config.rechargeRules = rules.sort((a, b) => a.minAmount - b.minAmount);
  writeJSONFile('config.json', config);
  return config.rechargeRules;
}

export function getPointsRules(): PointsRules {
  const config = getConfig();
  return config.pointsRules;
}

export function updatePointsRules(rules: PointsRules): PointsRules {
  const config = getConfig();
  config.pointsRules = rules;
  writeJSONFile('config.json', config);
  return config.pointsRules;
}

export function getServices(): ServiceItem[] {
  const config = getConfig();
  return config.services;
}

export function updateServices(services: ServiceItem[]): ServiceItem[] {
  const config = getConfig();
  config.services = services;
  writeJSONFile('config.json', config);
  return config.services;
}

export function getBirthdayConfig(): BirthdayConfig {
  const config = getConfig();
  return config.birthdayConfig;
}

export function updateBirthdayConfig(config: BirthdayConfig): BirthdayConfig {
  const systemConfig = getConfig();
  systemConfig.birthdayConfig = config;
  writeJSONFile('config.json', systemConfig);
  return systemConfig.birthdayConfig;
}
