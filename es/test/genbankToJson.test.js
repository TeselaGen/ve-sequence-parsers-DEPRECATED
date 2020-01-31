/* eslint-disable no-unused-expressions*/
import assert from "assert";
import genbankToJson from "../parsers/genbankToJson";

import path from "path";
import fs from "fs";
import chai from "chai";
import chaiSubset from "chai-subset";
import jsonToGenbank from "../parsers/jsonToGenbank";

chai.use(chaiSubset);
chai.use(require("chai-things"));
chai.should();

describe("genbankToJson tests", function() {
  it(`parses out the DIVISION property correctly https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#GenBankDivisionB`, done => {
    const string = `LOCUS       ProteinSeq          10 bp    DNA  linear  PLN  04-MAR-2019
ORIGIN      
    1 gtagaggccg     
//`;
    genbankToJson(
      string,
      function(result) {
        result[0].parsedSequence.name.should.equal("ProteinSeq");
        result[0].parsedSequence.gbDivision.should.equal("PLN");
        result[0].parsedSequence.type.should.equal("DNA");
        // result[0].parsedSequence.isProtein.should.be.
        result[0].parsedSequence.sequence.should.equal("gtagaggccg");
        result[0].parsedSequence.size.should.equal(10);
        const gbString = jsonToGenbank(result[0].parsedSequence);
        assert(gbString.includes(" PLN "));
        done();
      },
      {
        /* preserveLocations: true */
      }
    );
  });
  it(`does not parse a dna file with the name ProteinSeq into a protein `, done => {
    const string = `LOCUS       ProteinSeq          10 bp    DNA  linear    04-MAR-2019
ORIGIN      
    1 gtagaggccg     
//`;
    genbankToJson(
      string,
      function(result) {
        result[0].parsedSequence.name.should.equal("ProteinSeq");
        result[0].parsedSequence.type.should.equal("DNA");
        // result[0].parsedSequence.isProtein.should.be.
        result[0].parsedSequence.sequence.should.equal("gtagaggccg");
        result[0].parsedSequence.size.should.equal(10);
        done();
      },
      {
        /* preserveLocations: true */
      }
    );
  });
  it(`parses a protein genbank file into a protein sequence json by default `, done => {
    const string = `LOCUS       Untitled_Sequence          10 aa  linear    04-MAR-2019
ORIGIN      
    1 MTCAGRRAYL     
//`;
    genbankToJson(
      string,
      function(result) {
        result[0].parsedSequence.name.should.equal("Untitled_Sequence");
        result[0].parsedSequence.type.should.equal("PROTEIN");
        result[0].parsedSequence.isProtein.should.equal(true);
        result[0].parsedSequence.proteinSequence.should.equal("MTCAGRRAYL");
        result[0].parsedSequence.proteinSize.should.equal(10);
        done();
      },
      {
        /* preserveLocations: true */
      }
    );
  });

  it("handles joined features/parts correctly", function(done) {
    const string = fs.readFileSync(
      path.join(
        __dirname,
        "./testData/genbank/gbWithJoinedFeaturesAndParts.gb"
      ),
      "utf8"
    );
    genbankToJson(
      string,
      function(result) {
        result[0].parsedSequence.features.should.containSubset([
          {
            name: "reg_elem",
            start: 867,
            end: 1017,
            locations: [
              {
                start: 867,
                end: 961
              },
              {
                start: 975,
                end: 1017
              }
            ],
            strand: 1
          }
        ]);
        done();
      },
      {
        /* preserveLocations: true */
      }
    );
  });
  it("parses the sequence definition field", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/pRF127_GanBankStandard.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result[0].parsedSequence.definition.should.equal(
        "synthetic circular DNA"
      );
      done();
    });
  });
  it("does not give an erroneous feature name too long warning", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/pRF127_GanBankStandard.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result[0].messages.length.should.equal(0);
      done();
    });
  });
  it("truncates a feature that runs off the end to the end instead of to 0", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/gbWithWrappingFeature.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.size.should.equal(103);
      result[0].parsedSequence.features.should.containSubset([
        {
          name: "GFPuv",
          start: 0,
          end: 102
        }
      ]);
      done();
    });
  });
  it("handles parsing of a protein genbank correctly, making sure not to have too long of feature names", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/proteinTestSeq1.gp"),
      "utf8"
    );
    const options = { isProtein: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.type.should.equal("PROTEIN");
        result[0].parsedSequence.features.forEach(function(feat) {
          feat.name.length.should.be.below(101);
        });
        done();
      },
      options
    );
  });
  it("handles parsing of a protein genbank that only has DNA chars", function(done) {
    const string = fs.readFileSync(
      path.join(
        __dirname,
        "./testData/genbank/proteinTestSeq2_onlyDnaChars.gp"
      ),
      "utf8"
    );
    const options = { isProtein: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.type.should.equal("PROTEIN");
        done();
      },
      options
    );
  });
  it("handles parsing of a protein genbank correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/sequence.gp"),
      "utf8"
    );
    const options = { isProtein: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.features.should.be.length(4);
        result[0].parsedSequence.isProtein.should.equal(true);

        result[0].parsedSequence.features.should.include.something.that.deep.equals(
          {
            notes: { product: ["Rfp"] },
            name: "red fluorescent protein",
            start: 0,
            end: 674,
            type: "protein",
            strand: 1
          }
        );
        done();
      },
      options
    );
  });
  it("handles 1-based feature indices option for both start and end", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/pBbS0c-RFP.gb"),
      "utf8"
    );
    const options = { inclusive1BasedEnd: true, inclusive1BasedStart: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.features.should.include.something.that.deep.equals(
          {
            notes: {
              note: [
                "REP_ORIGIN REP_ORIGIN pSC101* aka pMPP6, gives plasmid number 3 -4 copies per cell, BglII site in pSC101* ori has been dele ted by quick change agatcT changed to agatcA giving pSC101* * pSC101* aka pMPP6, gives plasmid number 3-4copies p er cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101** [pBbS0a-RFP]",
                "pSC101* aka pMPP6, gives plasmid number 3-4 copies per cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101**"
              ],
              gene: ["SC101** Ori"],
              vntifkey: ["33"]
            },
            name: "pSC101**",
            start: 1074,
            end: 3302,
            type: "rep_origin",
            strand: -1
          }
        );
        done();
      },
      options
    );
  });
  it("handles parsing of an oddly spaced genbank without failing", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/breakingGenbank.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.features.should.be.length(13);
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        {
          notes: {},
          name: "araC",
          start: 6,
          end: 882,
          type: "CDS",
          strand: -1
        }
      );
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        {
          notes: {},
          name: "T0",
          start: 4300,
          end: 4403,
          type: "terminator",
          strand: 1
        }
      );
      done();
    });
  });

  it("parses a genbank with just feature start locations correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/rhaBp-Pfu-pUN_alt.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
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

  it("parses a genbank that is implicitly non-circular as circular because it contains circular features", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/Ecoli_DERA_Implicitly_Circular.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.circular.should.equal(true);
      result[0].parsedSequence.features.should.containSubset([
        {
          name: "rhaBADp",
          start: 410,
          end: 182
        }
      ]);
      done();
    });
  });

  it("parses a genbank that is implicitly linear and has no circular features as linear", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/Ecoli_DERA_Implicitly_Linear.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.circular.should.equal(false);
      done();
    });
  });

  it("handles feature names with = signs in them (doesn't truncate them before the equal sign)", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbankFeatWithEqualSignInIt.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.features.should.containSubset([{
        name: "CRP=cAMP binding site"
      }])
      done();
    });
  });

  it("parses plasmid with run-on feature note (pBbS0c-RFP.gb) correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/pBbS0c-RFP.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        {
          notes: {
            note: [
              "REP_ORIGIN REP_ORIGIN pSC101* aka pMPP6, gives plasmid number 3 -4 copies per cell, BglII site in pSC101* ori has been dele ted by quick change agatcT changed to agatcA giving pSC101* * pSC101* aka pMPP6, gives plasmid number 3-4copies p er cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101** [pBbS0a-RFP]",
              "pSC101* aka pMPP6, gives plasmid number 3-4 copies per cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101**"
            ],
            gene: ["SC101** Ori"],
            vntifkey: ["33"]
          },
          name: "pSC101**",
          start: 1073,
          end: 3301,
          type: "rep_origin",
          strand: -1
        }
      );
      result.should.be.an("array");
      result.should.be.length(1);
      result[0].parsedSequence.features.should.be.length(5);
      result[0].parsedSequence.circular.should.equal(true);
      result[0].parsedSequence.size.should.equal(4224);
      done();
    });
  });
  it("parses pBbE0c-RFP.gb correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/pBbE0c-RFP.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result.should.be.length(1);
      result[0].parsedSequence.features.should.be.length(4);
      result[0].parsedSequence.circular.should.equal(true);
      result[0].parsedSequence.size.should.equal(2815);
      result[0].parsedSequence.features.should.include.something.that.deep.equals(
        {
          notes: {
            note: [
              "GENE [ZFP-GG destination LacUV5 p15A CmR]",
              "[ZFP-GG destination LacUV5 p15A CmR]"
            ],
            vntifkey: ["22"],
            gene: ["CmR"]
          },
          name: "CmR",
          start: 2010,
          end: 2669,
          type: "gene",
          strand: -1
        }
      );
      done();
    });
  });
  it("handles parsing of a multi-seq genbank correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/multi-seq-genbank.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result.should.be.length(4);
      result[0].parsedSequence.features.should.be.length(0);
      result[0].parsedSequence.size.should.equal(109);

      result.forEach(function(innerResult) {
        innerResult.success.should.be.true;
      });
      done();
    });
  });

  it("parses a gb with features of type primer, outputs json w/primers at top level by default", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testing_primers.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result.should.be.length(1);
      result[0].parsedSequence.features.should.be.length(2);
      result[0].parsedSequence.primers.should.be.length(2);
      result[0].parsedSequence.features.should.containSubset([
        {
          notes: {},
          type: "misc_feature",
          strand: 1,
          name: "feature1",
          start: 1,
          end: 3
        },
        {
          notes: {},
          type: "misc_feature",
          strand: 1,
          name: "feature2",
          start: 11,
          end: 15
        }
      ]);
      result[0].parsedSequence.primers.should.containSubset([
        {
          notes: {},
          type: "primer",
          strand: 1,
          name: "primer1",
          start: 5,
          end: 9
        },
        {
          notes: {},
          type: "primer",
          strand: 1,
          name: "primer2",
          start: 17,
          end: 23
        }
      ]);

      result.forEach(function(innerResult) {
        innerResult.success.should.be.true;
      });
      done();
    });
  });

  it("parses a gb with features of type primer, outputs json w/primers as features of type primer because primersAsFeatures = true", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testing_primers.gb"),
      "utf8"
    );
    const options = { primersAsFeatures: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result.should.be.length(1);
        result[0].parsedSequence.features.should.be.length(4);
        result[0].parsedSequence.features.should.containSubset([
          {
            notes: {},
            type: "misc_feature",
            strand: 1,
            name: "feature1",
            start: 1,
            end: 3
          },
          {
            notes: {},
            type: "primer",
            strand: 1,
            name: "primer1",
            start: 5,
            end: 9
          },
          {
            notes: {},
            type: "misc_feature",
            strand: 1,
            name: "feature2",
            start: 11,
            end: 15
          },
          {
            notes: {},
            type: "primer",
            strand: 1,
            name: "primer2",
            start: 17,
            end: 23
          }
        ]);

        result.forEach(function(innerResult) {
          innerResult.success.should.be.true;
        });
        done();
      },
      options
    );
  });

  it("parses a multi-seq gb with features of type primer, outputs json w/primers at top level by default", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testing_primers_multiseq.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result.should.be.length(2);
      result[0].parsedSequence.features.should.be.length(2);
      result[0].parsedSequence.primers.should.be.length(2);
      result[1].parsedSequence.features.should.be.length(2);
      result[1].parsedSequence.primers.should.be.length(2);

      result.forEach(function(innerResult) {
        innerResult.success.should.be.true;
      });
      done();
    });
  });

  it("parses a multi-seq gb with features of type primer, outputs json w/primers as features of type primer because primersAsFeatures = true", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testing_primers_multiseq.gb"),
      "utf8"
    );
    const options = { primersAsFeatures: true };
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result.should.be.length(2);
        result[0].parsedSequence.features.should.be.length(4);
        result[1].parsedSequence.features.should.be.length(4);

        result.forEach(function(innerResult) {
          innerResult.success.should.be.true;
        });
        done();
      },
      options
    );
  });

  it("parses pj5_00001 aka testGenbankFile.gb correctly", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/testGenbankFile.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result[0].parsedSequence.name.should.equal("pj5_00001");
      result[0].parsedSequence.circular.should.equal(true);
      result[0].parsedSequence.extraLines.length.should.equal(2);
      result[0].parsedSequence.features.length.should.equal(16);
      result[0].parsedSequence.parts.length.should.equal(1);
      result[0].parsedSequence.parts.should.include.something.that.deep.equals({
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""]
        },
        name: "pS8c-gfpuv_sig_pep_vector_backbone",
        start: 1238,
        end: 1234,
        type: "part",
        strand: 1
      });
      result[0].parsedSequence.sequence.length.should.equal(5299);
      done();
    });
  });
  it("parses a .gb file where the feature name is a number", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/featNameIsNumber.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      done();
    });
  });
  it('takes in a snapgene exported sequence and sets its name correctly (instead of "Export" it will use the filename)', function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/CCR5_multifrag_insert1.gb"),
      "utf8"
    );
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.name.should.equal("CCR5_multifrag_insert1");
        done();
      },
      { fileName: "CCR5_multifrag_insert1.gb" }
    );
  });
  it("if splitLocations=true, it parses a .gb file with joined features (aka a single feature with multiple locations) and splits them into multiple individaul features", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/RTO4_16460_joined_feature.gb"),
      "utf8"
    );
    genbankToJson(
      string,
      function(result) {
        result.should.be.an("array");
        result[0].success.should.be.true;
        result[0].parsedSequence.features.length.should.equal(12);
        done();
      },
      { splitLocations: true }
    );
  });
  it("parses a .gb file with tags on parts", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/gbFileWithTagsOnParts.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.parts.should.include.something.that.deep.equals({
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""],
          tag: ["blue", "red"]
        },
        name: "pS8c-gfpuv",
        start: 1238,
        end: 1234,
        type: "part",
        strand: 1
      });
      result[0].parsedSequence.parts.should.include.something.that.deep.equals({
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""],
          tag: ["red", "green"]
        },
        name: "pS8c-gfpuv_sig_pep_vector_backbone",
        start: 1238,
        end: 1234,
        type: "part",
        strand: 1
      });
      done();
    });
  });
  it("parses a .gb file with tags on parts, adding parts", function(done) {
    const string = fs.readFileSync(
      path.join(__dirname, "./testData/genbank/gbFileWithTagsOnParts.gb"),
      "utf8"
    );
    genbankToJson(string, function(result) {
      result.should.be.an("array");
      result[0].success.should.be.true;
      result[0].parsedSequence.features.should.not.include.something.that.deep.equals(
        {
          notes: {
            preferred3PrimeOverhangs: [""],
            preferred5PrimeOverhangs: [""],
            tag: ["blue", "red"]
          },
          name: "pS8c-gfpuv",
          start: 1238,
          end: 1234,
          type: "misc_feature",
          strand: 1
        }
      );
      result[0].parsedSequence.parts.should.include.something.that.deep.equals({
        notes: {
          preferred3PrimeOverhangs: [""],
          preferred5PrimeOverhangs: [""],
          tag: ["red", "green"]
        },
        name: "pS8c-gfpuv_sig_pep_vector_backbone",
        start: 1238,
        end: 1234,
        type: "part",
        strand: 1
      });
      done();
    });
  });
});
// const string = fs.readFileSync(path.join(__dirname, '../../../..', './testData/genbank (JBEI Private)/46.gb'), "utf8");
// const string = fs.readFileSync(__dirname + '/testGenbankFile.gb', "utf8");

// const string = fs.readFileSync(path.join(__dirname, '../../../..', './testData/genbank (JBEI Private)/46.gb'), "utf8");
// genbankToJson(string, function(result) {
//     assert.equal(result[0].parsedSequence.name, 'CYP106A2__AdR__A');
//     // assert.equal(result[0].parsedSequence.name, 'CYP106A2__AdR__A'); //names are currently parsed to remove "special characters"
//     assert.equal(result[0].parsedSequence.circular, true);
//     assert.equal(result[0].parsedSequence.extraLines.length, 7);
//     assert.equal(result[0].parsedSequence.features.length, 38);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'origin' && feature.start === 388 && feature.end === 3884 && feature.type === 'origin' && feature.strand === 1) {
//             return true;
//         }
//     }).length);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'T7 promoter' && feature.start === 51 && feature.end === 536 && feature.type === 'promoter' && feature.strand === -1) {
//             return true;
//         }
//     }).length);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'RBS' && feature.start === 672 && feature.end === 6729 && feature.type === 'protein_bind' && feature.strand === -1) {
//             return true;
//         }
//     }).length);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'RBS' && feature.start === 2 && feature.end === 122 && feature.type === 'protein_bind' && feature.strand === -1) {
//             return true;
//         }
//     }).length);
//     assert(result[0].parsedSequence.sequence.length === 6759);
// });
