require("dotenv").config();

const config = require("./config");
const express = require("express");
const { body, validationResult } = require("express-validator");
const uuid = require("uuid");
const crypto = require("crypto");
const cors = require("cors");

if (!config.SECRET) throw new Error(`'SECRET' must be provided in your .env`);

const app = express();

app.use(cors());
app.use(express.json());

app.post(
  "/cashback/validate",
  body("hash").notEmpty().withMessage(`'hash' is missing`),
  body("hash").isHash("sha256").withMessage(`'hash' is invalid`),
  body("payload").notEmpty().withMessage(`'payload' is missing`),
  // transform
  body("payload").customSanitizer((value) => decodeURIComponent(value)),
  body("payload")
    .isBase64()
    .withMessage(`'payload' must be Base64 encoded string`),
  (req, res) => {
    const errors = validationResult(req);

    console.log("errors", errors);

    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];

      return res.status(400).end(firstError.msg);
    }

    const hash = crypto
      .createHmac("sha256", config.SECRET)
      .update(req.body.payload)
      .digest("hex");

    if (hash !== req.body.hash)
      return res.status(403).end(`Cashback data isn't valid`);

    const stringPayload = Buffer.from(req.body.payload, "base64").toString(
      "utf-8"
    );

    const payload = JSON.parse(stringPayload);

    console.log("payload", payload);

    res.end();
  }
);

app.post("/cashback", (req, res) => {
  /** @todo validate API_KEY header */

  const payload = {
    merchant_id: config.MOCK_MERCHANT_ID,
    cashback_amount: 1.15,
    currency: "eur",
    cashback_id: uuid.v4(),
    creation_time: Date.now().toString(),
  };

  console.log("payload", payload);

  const stringPayload = JSON.stringify(payload);

  const base64Payload = Buffer.from(stringPayload).toString("base64");

  const hash = crypto
    .createHmac("sha256", config.SECRET)
    .update(base64Payload)
    .digest("hex");

  const link = new URL(`https://nearcashback.com`);
  link.pathname = "/claim";
  link.searchParams.set("hash", hash);
  link.searchParams.set("payload", base64Payload);

  return res.status(200).end(link.toString());
});

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
