export * from "./prices";

export default {
  PORT: process.env.PORT,
  API_KEY: process.env.API_KEY || "",
  CLAIM_DOMAIN: process.env.CLAIM_DOMAIN || "",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  CONTRACT_ID: process.env.CONTRACT_ID || "",
  NETWORK: process.env.NETWORK || "development",
};
