import { parseCSV } from "./parser";

const CSV_TEST_DATA = `BatchID    ,Drug_id                  ,Batch_No                                          ,ExpDate                ,Stock                   ,Activate,Retail               ,Cost                 ,DateCreated            ,User                                              
-----------,-------------------------,--------------------------------------------------,-----------------------,------------------------,--------,---------------------,---------------------,-----------------------,--------------------------------------------------
345,333787130834,9999,00:00.0,0,1,80,56,22:38.0,NULL                                              
346,11118428,9999,00:00.0,0,1,62,28.725,39:47.0,NULL                                              
349,11118924,9999,00:00.0,0,1,105,59.5,                   NULL,NULL                                              
353,11119717,9999,00:00.0,0,1,70,38.5,21:12.0,NULL                                              `;

describe("Parse CSV", () => {
  it("should parse csv", async () => {
    const { data, errors } = parseCSV(CSV_TEST_DATA);
    expect(errors).toEqual([]);
    expect(data).toEqual([
      {
        BatchID: "345",
        Drug_id: "333787130834",
        Batch_No: "9999",
        ExpDate: "00:00.0",
        Stock: "0",
        Activate: "1",
        Retail: "80",
        Cost: "56",
        DateCreated: "22:38.0",
        User: null,
      },
      {
        BatchID: "346",
        Drug_id: "11118428",
        Batch_No: "9999",
        ExpDate: "00:00.0",
        Stock: "0",
        Activate: "1",
        Retail: "62",
        Cost: "28.725",
        DateCreated: "39:47.0",
        User: null,
      },
      {
        BatchID: "349",
        Drug_id: "11118924",
        Batch_No: "9999",
        ExpDate: "00:00.0",
        Stock: "0",
        Activate: "1",
        Retail: "105",
        Cost: "59.5",
        DateCreated: null,
        User: null,
      },
      {
        BatchID: "353",
        Drug_id: "11119717",
        Batch_No: "9999",
        ExpDate: "00:00.0",
        Stock: "0",
        Activate: "1",
        Retail: "70",
        Cost: "38.5",
        DateCreated: "21:12.0",
        User: null,
      },
    ]);
  });
});
