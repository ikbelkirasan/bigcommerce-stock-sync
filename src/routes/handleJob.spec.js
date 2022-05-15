import handler from "./handleJob.js";

describe("handleJob", () => {
  it("should respond with ok", async () => {
    const req = {
      body: {
        csvFileUrl: "",
      },
    };
    const res = {};

    const firstResponse = await handler(req, res);
    const finalResponse = await firstResponse.jobPromise;
    expect(firstResponse).toEqual({
      started: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
    });
    expect(finalResponse).toEqual({});
  });
});
