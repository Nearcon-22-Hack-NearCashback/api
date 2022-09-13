import { PRICE_MAPPING } from "../config";
import { CashbackCurrency } from "../core/enums";
import { IComissionRate } from "../core/types";

export const getMerchantFromApiKey = (key: string): string => {
  return "bc9623ed-3cdb-4ebe-9a78-c8d96d01fa33";
};

export const getComissionRateByMerchant = (
  merchant_id: string
): IComissionRate => {
  return {
    nominator: 1,
    denominator: 100,
  };
};

export const getExchangeRateByCurrency = (
  currency: CashbackCurrency
): number => {
  const rate = PRICE_MAPPING[currency];

  if (!rate)
    throw new Error(`Missing currency '${currency}' in your config/prices.ts`);

  return rate;
};
