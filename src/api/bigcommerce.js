import axios from "axios";
import axiosRetry from "axios-retry";
import retryAfter from "axios-retry-after";
import delay from "delay";

class BaseService {
  constructor(root) {
    this.root = root;
  }
}

class ProductsService extends BaseService {
  async list(options) {
    return this.root.request({
      method: "GET",
      url: "/v3/catalog/products",
      params: options,
    });
  }

  async batchUpdates(data) {
    return this.root.request({
      method: "PUT",
      url: "/v3/catalog/products",
      data,
    });
  }
}

export class BigCommerceAPI {
  products = new ProductsService(this);

  constructor({ storeHash, authToken }) {
    this.storeHash = storeHash;
    this.authToken = authToken;

    this.axios = axios.create({
      baseURL: `https://api.bigcommerce.com/stores/${this.storeHash}`,
      headers: {
        "X-Auth-Token": this.authToken,
      },
    });

    this.axios.interceptors.response.use(
      undefined,
      retryAfter(this.axios, {
        // Determine when we should attempt to retry
        isRetryable(error) {
          return (
            error.response &&
            error.response.status === 429 &&
            // Use X-Retry-After rather than Retry-After
            error.response.headers["x-retry-after"]
          );
        },

        // Customize the wait behavior
        wait(error) {
          return delay(error.response.headers["x-retry-after"] * 1000);
        },

        // Customize the retry request itself
        retry(axios, error) {
          if (!error.config) {
            throw error;
          }

          return axios(error.config);
        },
      }),
    );

    axiosRetry(this.axios);
  }

  async request(options) {
    const response = await this.axios.request(options);
    return response.data;
  }
}
