import { CommissionSettings } from '../src/types/index';

export function calculateCommissionBreakdown(
  rewardAmount: number,
  config: CommissionSettings
): {
  totalAmount: number;
  rangaCommission: number;
  finderPayout: number;
  currency: string;
  explanation: string;
} {
  const amount = Math.max(0, rewardAmount || 0);

  let commission = 0;
  if (config.commissionType === 'percentage') {
    commission = Math.round((amount * config.commissionValue) / 100);
  } else {
    commission = Math.min(amount, config.commissionValue);
  }

  // Calculate Finder Payout
  let finderPayout = 0;
  if (config.finderRewardType === 'percentage') {
    finderPayout = Math.max(0, Math.round((amount * config.finderRewardValue) / 100));
  } else {
    finderPayout = Math.max(0, amount - commission);
  }

  // Ensure balance doesn't exceed total amount
  if (commission + finderPayout > amount) {
    commission = Math.max(0, amount - finderPayout);
  }

  return {
    totalAmount: amount,
    rangaCommission: commission,
    finderPayout: finderPayout,
    currency: config.currency || 'RWF',
    explanation: config.commissionType === 'percentage' 
      ? `Ranga commission is ${config.commissionValue}% (${commission.toLocaleString()} ${config.currency}) and honest finder receives ${finderPayout.toLocaleString()} ${config.currency}.`
      : `Fixed fee of ${commission.toLocaleString()} ${config.currency} applies.`
  };
}
