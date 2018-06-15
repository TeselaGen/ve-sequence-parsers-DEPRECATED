// const tap = require('tap');

// tap.mochaGlobals();
/**
 * testing file for the snapgene parser, which should be able to handle multiple sequences in the same file, comments, and any other sort of vaild snapgene format
 * @author Joshua P Nixon
 */
const snapgeneToJson = require("../parsers/snapgeneToJson");
const path = require("path");
const fs = require("fs");
const chai = require("chai");
chai.use(require("chai-things"));
chai.should();

describe("snapgene tests", function() {
  it("import protein fasta file without replacing spaces to underscore in name", function(
    done
  ) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/dna/test_sequence_1.dna"),
      "ascii"
    );
    snapgeneToJson(
      string,
      function(result) {
        result[0].parsedSequence.name.should.equal("thomas's seq");
        result[0].parsedSequence.sequence.should.equal("gtacaaaTTTT");
        result[0].parsedSequence.features.should.containSubset([{
          start: 4, end: 5, name: ""
        }]);
        done();
      },
      {
        isProtein: true
      }
    );
  });
});
