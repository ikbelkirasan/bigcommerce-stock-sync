import "dotenv/config.js";

export default {
  bigCommerce: {
    storeHash: process.env.BIGCOMMERCE_STORE_HASH,
    accessToken: process.env.BIGCOMMERCE_ACCESS_TOKEN,
  },
  web: {
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 5000,
  },
};
