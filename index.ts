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
} from "./utils";

if (!config.SECRET) throw new Error(`'SECRET' must be provided in your .env`);
if (!config.API_KEY) throw new Error(`'API_KEY' must be provided in your .env`);
if (!config.CLAIM_DOMAIN)
  throw new Error(`'CLAIM_DOMAIN' must be provided in your .env`);

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
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];

      return res.status(400).end(firstError.msg);
    }

    const currency = req.body.currency as CashbackCurrency;
    const floatAmount = req.body.amount as number;

    const exchangeRate = getExchangeRateByCurrency(currency);

    const apiKey = req.headers["x-api-key"] as string;
    const merchantId = getMerchantFromApiKey(apiKey);

    const comissionRate = getComissionRateByMerchant(merchantId);

    const cashbackAmountInNear =
      (floatAmount / exchangeRate) *
      (comissionRate.nominator / comissionRate.denominator);

    console.log("cashbackAmountInNear", cashbackAmountInNear);

    const cashbackAmountYoctoNear = naj.utils.format.parseNearAmount(
      cashbackAmountInNear.toString()
    );

    console.log("cashbackAmountYoctoNear", cashbackAmountYoctoNear);

    const keyPair = naj.utils.KeyPairEd25519.fromRandom();

    const publicKey = Buffer.from(keyPair.getPublicKey().data).toString("hex");
    const privateKey = keyPair.secretKey;

    /** @todo contract.createCashback(pub_key, amount) => returning cashback_id */

    const cashbackId = "271";

    // const payload = {
    //   merchant_id: config.MOCK_MERCHANT_ID,
    //   cashback_amount: 1.15,
    //   currency: "eur",
    //   cashback_id: uuidv4(),
    //   creation_time: Date.now().toString(),
    // };

    const link = new URL(config.CLAIM_DOMAIN);
    link.pathname = "/claim";

    link.searchParams.set("key", privateKey);
    link.searchParams.set("id", cashbackId);

    return res.status(200).end(link.toString());
  }
);

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
