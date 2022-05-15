import nock from "nock";
import config from "../config.js";
import { Workflow } from "./workflow.js";
import { mockBigCommerceAPI } from "../test/mocks.js";

describe("Workflow", () => {
  it("should work", async () => {
    const file = `BatchID    ,Drug_id                  ,Batch_No                                          ,ExpDate                ,Stock                   ,Activate,Retail               ,Cost                 ,DateCreated            ,User                                              
    -----------,-------------------------,--------------------------------------------------,-----------------------,------------------------,--------,---------------------,---------------------,-----------------------,--------------------------------------------------
    345,SLCTBS,1,00:00.0,10,1,80,56,22:38.0,NULL                                              
    349,OFSUC,2,00:00.0,20,1,105,59.5,                   NULL,NULL                                              `;

    const csvFileUrl = "http://example.com/file.csv";
    const authData = {
      authToken: config.bigCommerce.accessToken,
      storeHash: config.bigCommerce.storeHash,
    };

    nock.disableNetConnect();
    nock("http://example.com")
      .get("/file.csv")
      .reply(200, file);

    const mock = mockBigCommerceAPI(authData);
    // List products: Page 1
    mock.products.list({ limit: 250, page: 1 }).reply(200, {
      data: [{ id: 1, sku: "SLCTBS" }],
      meta: {
        pagination: { page: 1, total: 2 },
      },
    });
    // List products: Page 2
    mock.products.list({ limit: 250, page: 2 }).reply(200, {
      data: [{ id: 2, sku: "OFSUC" }],
      meta: {
        pagination: { page: 2, total: 2 },
      },
    });

    // Batch Updates
    mock.products
      .batchUpdate([
        { id: 1, sku: "SLCTBS", inventory_level: 10 },
        { id: 2, sku: "OFSUC", inventory_level: 20 },
      ])
      .reply(200, {
        data: [
          { id: 1, sku: "SLCTBS", inventory_level: 10, foo: "bar" },
          { id: 2, sku: "OFSUC", inventory_level: 20, foo: "bar" },
        ],
      });

    const workflow = new Workflow({ csvFileUrl });
    await workflow.start();
    expect(workflow.result).toEqual({
      status: "success",
      data: [
        { id: 1, sku: "SLCTBS", inventory_level: 10 },
        { id: 2, sku: "OFSUC", inventory_level: 20 },
      ],
    });
  });
});
