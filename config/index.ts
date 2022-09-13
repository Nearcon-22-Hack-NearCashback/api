export * from "./prices";

export default {
  PORT: process.env.PORT,
  MOCK_MERCHANT_ID: process.env.MOCK_MERCHANT_ID,
  SECRET: process.env.SECRET || "",
  API_KEY: process.env.API_KEY || "",
  CLAIM_DOMAIN: process.env.CLAIM_DOMAIN || "",
};

