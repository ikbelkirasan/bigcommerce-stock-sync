import axios from "axios";

export class ZapierStorage {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: "https://store.zapier.com",
      headers: {
        "X-Secret": this.secretKey,
      },
    });
    this.client.interceptors.response.use(undefined, error => {
      if (error.response) {
        error.message += ". " + JSON.stringify(error.response.data);
      }
      throw error;
    });
  }

  async load() {
    const response = await this.client.get("/api/records");
    const queue = response.data.data;
    return queue;
  }

  async save(queue) {
    const response = await this.client.post("/api/records", {
      data: queue,
    });
    return response.data;
  }
}
