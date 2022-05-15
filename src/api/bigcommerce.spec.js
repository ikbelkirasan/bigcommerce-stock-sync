import nock from "nock";
import { mockBigCommerceAPI } from "../test/mocks";
import { BigCommerceAPI } from "./bigcommerce";

describe("BigCommerce API", () => {
  const authData = {
    storeHash: "1234",
    authToken: "a_token",
  };

  beforeAll(() => {
    nock.disableNetConnect();
  });

  it("should retry on network errors", async () => {
    const mock = mockBigCommerceAPI(authData);
    mock.products.list().replyWithError({ code: "ETIMEDOUT" });
    mock.products.list().replyWithError({ code: "ENOTFOUND" });
    mock.products.list().replyWithError({ code: "ECONNREFUSED" });
    mock.products.list().reply(200, []);

    const api = new BigCommerceAPI(authData);
    const response = await api.products.list();
    expect(response).toEqual([]);
  });

  it("should retry on 429", async () => {
    const mock = mockBigCommerceAPI(authData);
    mock.products
      .list()
      .times(10)
      .reply(429, "", {
        "x-retry-after": 0.001,
      });

    mock.products.list().reply(200, []);

    const api = new BigCommerceAPI(authData);
    const response = await api.products.list();
    expect(response).toEqual([]);
  });
});
