import { CashbackCurrency } from "../core/enums";

export const PRICE_MAPPING: Record<CashbackCurrency, number> = {
  [CashbackCurrency.NEAR]: 1,
  [CashbackCurrency.EUR]: 4.8,
  [CashbackCurrency.USD]: 5,
};
