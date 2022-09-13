import dotenv from "dotenv";
dotenv.config();

import config from "./config";
import express from "express";
import { body, header, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import cors from "cors";
import { CashbackCurrency } from "./core/enums";
import naj from "near-api-js";

if (!config.SECRET) throw new Error(`'SECRET' must be provided in your .env`);
if (!config.API_KEY) throw new Error(`'API_KEY' must be provided in your .env`);
if (!config.CLAIM_DOMAIN)
  throw new Error(`'CLAIM_DOMAIN' must be provided in your .env`);

const app = express();

app.use(cors());
app.use(express.json());

// app.post(
//   "/cashback/validate",
//   body("hash").notEmpty().withMessage(`'hash' is missing`),
//   body("hash").isHash("sha256").withMessage(`'hash' is invalid`),
//   body("payload").notEmpty().withMessage(`'payload' is missing`),
//   // transform
//   body("payload").customSanitizer((value) => decodeURIComponent(value)),
//   body("payload")
//     .isBase64()
//     .withMessage(`'payload' must be Base64 encoded string`),
//   (req, res) => {
//     const errors = validationResult(req);

//     console.log("errors", errors);

//     if (!errors.isEmpty()) {
//       const firstError = errors.array({ onlyFirstError: true })[0];

//       return res.status(400).end(firstError.msg);
//     }

//     const hash = crypto
//       .createHmac("sha256", config.SECRET)
//       .update(req.body.payload)
//       .digest("hex");

//     if (hash !== req.body.hash)
//       return res.status(403).end(`Cashback data isn't valid`);

//     const stringPayload = Buffer.from(req.body.payload, "base64").toString(
//       "utf-8"
//     );

//     try {
//       const payload = JSON.parse(stringPayload);

//       console.log("payload", payload);

//       /** @todo validate expiration time */

//       return res.status(200).end();
//     } catch {
//       return res.status(400).end(`Invalid payload`);
//     }
//   }
// );

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

    console.log("errors", errors);

    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];

      return res.status(400).end(firstError.msg);
    }

    /** @todo get exchange rate for received currency */
    /** @todo get merchant_id by provided api_key */
    /** @todo get comission rate of the merchant (nominator, denominator) */
    /** @todo calculate cashback amount in Near (probably use BN.js) */
    /** @todo generate key pair */
    /** @todo contract.createCashback(pub_key, amount) => returning cashback_id */
    /** @todo generate link /claim with query params (id & key) */

    // const payload = {
    //   merchant_id: config.MOCK_MERCHANT_ID,
    //   cashback_amount: 1.15,
    //   currency: "eur",
    //   cashback_id: uuidv4(),
    //   creation_time: Date.now().toString(),
    // };

    // console.log("payload", payload);

    // const keyPair = naj.utils.KeyPairEd25519.fromRandom();

    // const stringPayload = JSON.stringify(payload);

    // const base64Payload = Buffer.from(stringPayload).toString("base64");

    // const hash = crypto
    //   .createHmac("sha256", config.SECRET)
    //   .update(base64Payload)
    //   .digest("hex");

    // const link = new URL(config.CLAIM_DOMAIN);
    // link.pathname = "/claim";
    // link.searchParams.set("hash", hash);
    // link.searchParams.set("payload", base64Payload);

    return res.status(200).end("https://nearcashback.com/claim?test=1");
  }
);

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
