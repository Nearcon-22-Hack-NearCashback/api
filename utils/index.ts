import config, { PRICE_MAPPING } from "../config";
import { CashbackCurrency } from "../core/enums";
import { IComissionRate } from "../core/types";
import * as naj from "near-api-js";

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

export const getNearConfig = (env: string): naj.ConnectConfig => {
  const keyStore = new naj.keyStores.InMemoryKeyStore();

  const keyPair = naj.KeyPair.fromString(config.PRIVATE_KEY);

  switch (env) {
    case "development":
      keyStore.setKey("testnet", config.CONTRACT_ID, keyPair);

      return {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        keyStore,
        headers: {},
      };
    case "production":
      keyStore.setKey("mainnet", config.CONTRACT_ID, keyPair);

      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        keyStore,
        headers: {},
      };
    default:
      throw new Error(`Invalid env provided for getNearConfig()`);
  }
};
