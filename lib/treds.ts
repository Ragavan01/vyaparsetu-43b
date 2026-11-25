import {CORPORATE_TAX_RATE} from './statutory';
import type {TredsInput, TredsSimulation} from './types';

export const DEFAULT_TREDS_INPUT: TredsInput = {
  invoiceAmount: 1250000,
  delayDays: 60,
  tredsAnnualRate: 9.2,
  informalAnnualRate: 28.0,
  buyerTaxRate: CORPORATE_TAX_RATE * 100,
};

export function simulateTreds(input: TredsInput): TredsSimulation {
  const amount = Math.max(0, input.invoiceAmount);
  const days = Math.max(1, Math.min(365, input.delayDays));
  const tredsRate = Math.max(0, input.tredsAnnualRate) / 100;
  const informalRate = Math.max(0, input.informalAnnualRate) / 100;
  const taxRate = Math.max(0, input.buyerTaxRate) / 100;

  const tredsDiscountCost = Math.round(amount * tredsRate * (days / 365));
  const netCashTodayTreds = Math.max(0, Math.round(amount - tredsDiscountCost));

  const informalCreditCost = Math.round(amount * informalRate * (days / 365));
  const netCashInformal = Math.max(0, Math.round(amount - informalCreditCost));

  const savingsVsInformal = Math.round(informalCreditCost - tredsDiscountCost);
  const annualizedMarginSavedPct =
    amount > 0
      ? Number(((savingsVsInformal / amount) * (365 / days) * 100).toFixed(2))
      : 0;

  const buyerTaxShieldPreserved = Math.round(amount * taxRate);

  return {
    tredsDiscountCost,
    netCashTodayTreds,
    informalCreditCost,
    netCashInformal,
    savingsVsInformal,
    annualizedMarginSavedPct,
    buyerTaxShieldPreserved,
    workingCapitalDaysUnlocked: days,
  };
}
