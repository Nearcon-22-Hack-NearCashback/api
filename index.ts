import dotenv from "dotenv";
dotenv.config();

import config from "./config";
import express from "express";
import { body, header, validationResult } from "express-validator";
import cors from "cors";
import { CashbackCurrency } from "./core/enums";
import * as naj from "near-api-js";
import {
  getComissionRateByMerchant,
  getExchangeRateByCurrency,
  getMerchantFromApiKey,
  getNearConfig,
} from "./utils";
import { CashbackContract } from "./core/cashback.contract";

if (!config.API_KEY) throw new Error(`'API_KEY' must be provided in your .env`);
if (!config.CLAIM_DOMAIN)
  throw new Error(`'CLAIM_DOMAIN' must be provided in your .env`);
if (!config.PRIVATE_KEY)
  throw new Error(`'PRIVATE_KEY' must be provided in your .env`);
if (!config.CONTRACT_ID)
  throw new Error(`'CONTRACT_ID' must be provided in your .env`);

let contract: CashbackContract;

const app = express();

app.use(cors());
app.use(express.json());

app.post(
  "/cashback",
  header("x-api-key").notEmpty().withMessage("API key is missing"),
  header("x-api-key").isIn([config.API_KEY]).withMessage("API key is invalid"),
  body("amount").notEmpty().withMessage(`'amount' is missing`),
  body("currency").notEmpty().withMessage(`'currency' is missing`),
  body("amount").isFloat().withMessage(`'amount' must be a float`),
  body("currency")
    .isIn(Object.values(CashbackCurrency))
    .withMessage(
      `'currency' isn't a valid value - choose one of ${Object.values(
        CashbackCurrency
      ).join(",")}`
    ),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];

      return res.status(400).end(firstError.msg);
    }

    const currency = req.body.currency as CashbackCurrency;
    const floatAmount = req.body.amount as number;

    console.debug("[body]", req.body);

    const exchangeRate = getExchangeRateByCurrency(currency);

    const apiKey = req.headers["x-api-key"] as string;
    const merchantId = getMerchantFromApiKey(apiKey);

    const comissionRate = getComissionRateByMerchant(merchantId);

    const cashbackAmountInNear =
      (floatAmount / exchangeRate) *
      (comissionRate.nominator / comissionRate.denominator);

    const cashbackAmountYoctoNear = naj.utils.format.parseNearAmount(
      cashbackAmountInNear.toString()
    );

    if (!cashbackAmountYoctoNear)
      throw new Error(`Couldn't calculate cashback amount in yoctoNear`);

    console.debug("[cashbackAmountYoctoNear]", cashbackAmountYoctoNear);

    const keyPair = naj.utils.KeyPairEd25519.fromRandom();

    const privateKey = keyPair.secretKey;

    const publicKey = keyPair.publicKey.toString().replace("ed25519:", "");

    const cashbackId = await contract.createCashback({
      pub_key: publicKey,
      amount: cashbackAmountYoctoNear,
    });

    const link = new URL(config.CLAIM_DOMAIN);
    link.pathname = "/claim";

    link.searchParams.set("key", privateKey.toString());
    link.searchParams.set("id", cashbackId.toString());

    return res.status(200).end(link.toString());
  }
);

(async () => {
  const near = await naj.connect(getNearConfig(config.NETWORK));

  const account = new naj.Account(near.connection, config.CONTRACT_ID);

  contract = new CashbackContract(account, config.CONTRACT_ID);

  app.listen(config.PORT, () => {
    console.log(`App listening on port ${config.PORT}`);
  });
})();
