import nock from "nock";

export function mockBigCommerceAPI(data) {
  return {
    products: new ProductsMock(data),
  };
}

class BaseMock {
  constructor({ storeHash, authToken }) {
    this.storeHash = storeHash;
    this.authToken = authToken;
    this.scope = nock(
      `https://api.bigcommerce.com/stores/${this.storeHash}`,
    ).matchHeader("x-auth-token", this.authToken);
  }
}

class ProductsMock extends BaseMock {
  list(options = {}) {
    return this.scope.get("/v3/catalog/products").query(options);
  }

  batchUpdate(data) {
    return this.scope.put("/v3/catalog/products", data);
  }
}
