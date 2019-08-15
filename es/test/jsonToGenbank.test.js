/* eslint-disable no-unused-expressions*/
import assert from "assert";

import parseGenbank from "../parsers/genbankToJson";
import jsonToGenbank from "../parsers/jsonToGenbank";
import path from "path";
import fs from "fs";
import chai from "chai";
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
chai.use(require("chai-things"));
chai.should();
describe("genbank exporter/parser conversion", function() {
  it(`should convert a protein sequence into a genpept`, () => {
    const proteinSequence = "MTCAGRRAYL";
    const sequence = "augacnugygcnggnmngmnggcnuayyun";
    const string = jsonToGenbank({
      isProtein: true,
      proteinSequence,
      sequence,
      features: [
        {
          name: "testFeat",
          start: 3, //by default features are dna-indexed when in tgen json form
          end: 29
        }
      ]
    });

    assert(string.indexOf(proteinSequence) !== -1);
    assert(string.indexOf("10 aa            linear") !== -1);
    assert(string.indexOf("misc_feature    2..10") !== -1);
    parseGenbank(string, function(result) {
      result[0].parsedSequence.proteinSequence.should.equal(proteinSequence);
      // result[0].parsedSequence.sequence.should.equal(sequence) //todo maybe the underlying sequence should be preserved somehow?
      result[0].parsedSequence.isProtein.should.equal(true);

      result[0].parsedSequence.features[0].start.should.equal(3);
      result[0].parsedSequence.features[0].end.should.equal(29);
    });
  });
  it(`should convert the .description field into a //DEFINITION block in 
  the genbank and then have it be parsed back out as a .description again`, () => {
    const description = "Hey I am a test description";
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      description
    });
    assert(string.indexOf("DEFINITION  " + description) !== -1);
    parseGenbank(string, function(result) {
      result[0].parsedSequence.description.should.equal(description);
    });
  });
  it(`
    should by default convert "sequenceData.parts" into genbank features 
    with a note of pragma: ['Teselagen_Part'] on it, and by default convert those features back into parts  `, function() {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const string = jsonToGenbank({
      sequence: "agagagagagag",
      parts: [
        {
          id: "id1",
          start: 2,
          end: 6
        }
      ]
    });
    parseGenbank(string, function(result) {
      result[0].parsedSequence.parts[0].start.should.equal(2);
      result[0].parsedSequence.parts[0].end.should.equal(6);
    });
  });
  it("should parse notes that come in as a JSON stringified object correctly", function() {
    // const breakingJSON = require('./testData/json/breakingJSON_stringified')
    const breakingJSON = require("./testData/json/1.json");
    const string = jsonToGenbank(breakingJSON);
    parseGenbank(string, function(result) {
      result[0].parsedSequence.features[0].notes.should.to.not.be.null;
    });
  });

  it("can interconvert between our parser and our exporter with a malformed genbank", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/breakingGenbank.gb"),
      "utf8"
    );
    parseGenbank(string, function(result) {
      const feat1 = {
        notes: {},
        name: "araC",
        start: 6,
        end: 882,
        type: "CDS",
        strand: -1
      };
      const feat2 = {
        notes: {},
        name: "T0",
        start: 4300,
        end: 4403,
        type: "terminator",
        strand: 1
      };
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.features.should.be.length(13);
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        feat1
      );
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        feat2
      );
      const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
      parseGenbank(exportedGenbankString, function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.features.should.be.length(13);

        result[0].parsedSequence.features.should.include.something.that.deep.equals(
          feat1
        );
        result[0].parsedSequence.features.should.include.something.that.deep.equals(
          feat2
        );
        done();
      });
    });
  });

  it("parses and converts pj5_00001 (aka testGenbankFile.gb) correctly (handling joined feature spans correctly also)", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testGenbankFile.gb"),
      "utf8"
    );
    parseGenbank(string, function(result) {
      result[0].parsedSequence.name.should.equal("pj5_00001");
      result[0].parsedSequence.definition.should.equal(
        "promoter seq from pBAD33."
      );
      result[0].parsedSequence.circular.should.equal(true);
      result[0].parsedSequence.extraLines.length.should.equal(2);
      result[0].parsedSequence.features.length.should.equal(16);
      result[0].parsedSequence.features.should.containSubset([
        {
          name: "XhoI_silent_mutation",
          start: 100,
          end: 400,
          locations: [
            {
              start: 100,
              end: 200
            },
            {
              start: 300,
              end: 400
            }
          ]
        }
      ]);

      result[0].parsedSequence.parts.should.containSubset([
        {
          notes: {
            preferred3PrimeOverhangs: [""],
            preferred5PrimeOverhangs: [""]
          },
          name: "pS8c-gfpuv_sig_pep_vector_backbone",
          start: 1238,
          end: 1234,
          type: "part",
          strand: 1
        }
      ]);
      result[0].parsedSequence.sequence.length.should.equal(5299);
      const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
      parseGenbank(exportedGenbankString, function(result) {
        result[0].parsedSequence.name.should.equal("pj5_00001");
        result[0].parsedSequence.definition.should.equal(
          "promoter seq from pBAD33."
        );
        result[0].parsedSequence.circular.should.equal(true);
        result[0].parsedSequence.extraLines.length.should.equal(2);
        result[0].parsedSequence.features.length.should.equal(16);
        result[0].parsedSequence.parts.should.containSubset([
          {
            notes: {
              preferred3PrimeOverhangs: [""],
              preferred5PrimeOverhangs: [""]
            },
            name: "pS8c-gfpuv_sig_pep_vector_backbone",
            start: 1238,
            end: 1234,
            type: "part",
            strand: 1
          }
        ]);
        result[0].parsedSequence.features.should.containSubset([
          {
            name: "XhoI_silent_mutation",
            start: 100,
            end: 400,
            locations: [
              {
                start: 100,
                end: 200
              },
              {
                start: 300,
                end: 400
              }
            ]
          }
        ]);
        result[0].parsedSequence.sequence.length.should.equal(5299);
        done();
      });
    });
  });

  it("parses and converts a genbank with just feature start locations correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/rhaBp-Pfu-pUN_alt.gb"),
      "utf8"
    );
    parseGenbank(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.features.should.containSubset([
        {
          name: "mutation",
          start: 264,
          end: 264
        },
        {
          name: "TSS",
          start: 291,
          end: 291
        }
      ]);
      const exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
      parseGenbank(exportedGenbankString, function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.features.should.containSubset([
          {
            name: "mutation",
            start: 264,
            end: 264
          },
          {
            name: "TSS",
            start: 291,
            end: 291
          }
        ]);
        done();
      });
    });
  });
  it("handles features in an array or a keyed object", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      features: {
        feat1: { start: 2, end: 4 }
      }
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.features.should.containSubset([
        {
          start: 2,
          end: 4
        }
      ]);
      done();
    });
  });
  it("should export warnings, assemblyPieces, and lineageAnnotations, as features with pragmas, preserving color and label color", function(done) {
    const exportedGenbankString = jsonToGenbank({
      name: "testing_primer_export",
      sequence: "ATGCATTGAGGACCTAACCATATCTAA",
      type: "DNA",
      lineageAnnotations: {
        "753": {
          id: "753",
          start: 5,
          end: 23,
          color: "indigo",
          name: "j5_lineage_annotation_to_export",
          strand: 1
        }
      },
      assemblyPieces: {
        "6667": {
          id: "6667",
          start: 5,
          end: 23,
          color: "#f0f0f0",
          name: "j5_assembly_piece_to_export",
          strand: 1
        }
      },
      warnings: [{
        id: "warning1",
        start: 5,
        end: 23,
        name: "warning1",

        color: "red",
        labelColor: "red",
        strand: 1
      }, {
        id: "warning2",
        start: 5,
        end: 23,
        name: "warning2",
        strand: 1
      }],
      features: {}
    });
    exportedGenbankString.should.include(`/pragma="j5_lineage_annotation"`)
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.lineageAnnotations.should.containSubset([{
        start: 5,
        end: 23,
        notes: {},
        color: "indigo",
        name: "j5_lineage_annotation_to_export",
        strand: 1
      }]);
      result[0].parsedSequence.assemblyPieces.should.containSubset([
        {
          start: 5,
          end: 23,
          notes: {},
          color: "#f0f0f0",
          name: "j5_assembly_piece_to_export",
          strand: 1
        }
      ]);
      result[0].parsedSequence.warnings.should.containSubset([{
        start: 5,
        end: 23,
        color: "red",
        labelColor: "red",
        name: "warning1",
        strand: 1
      }, {
        start: 5,
        end: 23,
        name: "warning2",
        strand: 1
      }]);
      done();
    });
  });
  it("should export primers as features with type set as primer", function(done) {
    const exportedGenbankString = jsonToGenbank({
      name: "testing_primer_export",
      sequence: "ATGCATTGAGGACCTAACCATATCTAA",
      type: "DNA",
      primers: {
        "753": {
          id: "753",
          start: 5,
          end: 23,
          type: "primer",
          name: "primer_to_export",
          strand: 1
        }
      },
      features: {}
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.primers.should.containSubset([
        {
          type: "primer",
          strand: 1,
          name: "primer_to_export",
          start: 5,
          end: 23
        }
      ]);
      done();
    });
  });
  it("handles inclusive1BasedStart and inclusive1BasedEnd options", function(done) {
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        features: {
          feat1: { start: 2, end: 4 }
        }
      },
      {
        inclusive1BasedStart: true,
        inclusive1BasedEnd: true
      }
    );
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.features.should.containSubset([
        {
          start: 1,
          end: 3
        }
      ]);
      done();
    });
  });
  it("gives genbank that is linear when circular is falsy", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      circular: false
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.circular.should.be.false;
      done();
    });
  });
  it('gives genbank that is linear when sequence.circular="0"', function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      circular: "0"
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.circular.should.be.false;
      done();
    });
  });
  it("handles reformatSeqName=false option", function(done) {
    const name = "$%^@#";
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        name: name
      },
      {
        reformatSeqName: false
      }
    );
    parseGenbank(
      exportedGenbankString,
      function(result) {
        result[0].parsedSequence.name.should.equal(name);
        done();
      },
      { reformatSeqName: false }
    );
  });
  // it('handles reformatSeqName=true (this is on by default) option', function(done) {
  //     const name = '$%^@#'
  //     const exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga',
  //       name: name
  //     }, {
  //       reformatSeqName: true
  //     })
  //     parseGenbank(exportedGenbankString, function(result) {
  //         result[0].parsedSequence.name.should.equal('_____')
  //         done();
  //     },{reformatSeqName: false});
  // });
  it("does not reformat a name with parens in it", function(done) {
    const name = "aaa(aaa)";
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga",
        name: name
      },
      {
        reformatSeqName: true
      }
    );
    parseGenbank(
      exportedGenbankString,
      function(result) {
        result[0].parsedSequence.name.should.equal(name);
        done();
      },
      { reformatSeqName: false }
    );
  });
  it("provides a default name if none is provided", function(done) {
    const exportedGenbankString = jsonToGenbank(
      {
        sequence: "gagagagagga"
      },
      {
        reformatSeqName: true
      }
    );
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.name.should.equal("Untitled_Sequence");
      parseGenbank(jsonToGenbank({ sequence: "gagagagagga" }), function(
        result
      ) {
        result[0].parsedSequence.name.should.equal("Untitled_Sequence");
        done();
      });
    });
  });
  it("adds a comment with the words teselagen_unique_id: XXXX if given a .teselagen_unique_id property", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      teselagen_unique_id: "gaslgawlgiubawg;12312asdf"
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.teselagen_unique_id.should.equal(
        "gaslgawlgiubawg;12312asdf"
      );
      done();
    });
  });
  it("adds a comment for the library field if the sequence has one", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      library: "libraryField"
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.library.should.equal("libraryField");
      done();
    });
  });
  it("adds a comment for the description if the sequence has one", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      description: "my sequence description"
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.description.should.equal(
        "my sequence description"
      );
      done();
    });
  });
  it("handles comments parsing and formatting", function(done) {
    const exportedGenbankString = jsonToGenbank({
      sequence: "gagagagagga",
      comments: ["gaslgawlgiubawg;12312asdf", "I am alive!"]
    });
    parseGenbank(exportedGenbankString, function(result) {
      result[0].parsedSequence.comments.length.should.equal(2);
      result[0].parsedSequence.comments[0].should.equal(
        "gaslgawlgiubawg;12312asdf"
      );
      result[0].parsedSequence.comments[1].should.equal("I am alive!");
      done();
    });
  });
});
