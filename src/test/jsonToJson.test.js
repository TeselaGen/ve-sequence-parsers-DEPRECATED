/**
 * test file for the ab1ToJson parser
 * @author Thomas Rich @tnrich
 */
import jsonToJson from "../parsers/jsonToJson";

import assert from "assert";
import chai from "chai";

chai.use(require("chai-things"));

chai.should();

describe("json to json parser", function() {
  it("should produce output a string", async function() {
    const jsonInfo = {
        name: "testseq",
        orfs: "123",
        sequence: "agagtagacgattgaccaggtttagag",
        features: [
          {
            id: "id1",
            start: 2,
            end: 6
          },
          {
            id: "id2",
            start: 8,
            end: 20
          }
        ]
      };
      
      const jsonOutput = jsonToJson(jsonInfo)
      assert(typeof(jsonOutput) === "string")
  });
});

describe("json to json parser", function() {
  it("should extraneous sequence fields and keep others", async function() {
    const jsonInfo = {
        name: "testseq",
        orfs: "123",
        sequence: "agagtagacgattgaccaggtttagag",
        features: [
          {
            id: "id1",
            start: 2,
            end: 6
          },
          {
            id: "id2",
            start: 8,
            end: 20
          }
        ]
      };
      
      const jsonOutput = jsonToJson(jsonInfo)

      assert(!jsonOutput.includes("orfs"))
      assert(jsonOutput.includes("name"))
  });
});
