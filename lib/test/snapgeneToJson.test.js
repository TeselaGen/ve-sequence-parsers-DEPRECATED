/**
 * testing file for the snapgene parser, which should be able to handle multiple sequences in the same file, comments, and any other sort of vaild snapgene format
 */
import snapgeneToJson from '../parsers/snapgeneToJson';

import path from 'path';
import fs from 'fs';
import chai from 'chai';
import chaiSubset from 'chai-subset';
chai.use(require("chai-things"));
chai.use(chaiSubset);
chai.should();

describe("snapgene file parser", function() {
  it("linear dna w/feature on forward strand", function(done) {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_linear.dna")
      // path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_linear.dna"),
    );
    snapgeneToJson(
      fileObj,
      function(result) {
        result[0].parsedSequence.name.should.equal(
          "GFPuv_025_fwdfeature_linear"
        );
        result[0].parsedSequence.circular.should.equal(
          false
        );
        result[0].parsedSequence.sequence.toLowerCase().should.equal(
          "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
        );
        result[0].parsedSequence.features.should.containSubset([
          {
            // we're returning 0-based
            start: 399,
            end: 499,
            name: "fwdFeature"
          }
        ]);
        done();
      },
      {
        fileName: "GFPuv_025_fwdfeature_linear.dna"
      }
    );
  });
  it("circular dna w/feature on forward strand", function(done) {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_fwdfeature_circular.dna")
    );
    snapgeneToJson(
      fileObj,
      function(result) {
        result[0].parsedSequence.name.should.equal(
          "GFPuv_025_fwdfeature_circular"
        );
        result[0].parsedSequence.circular.should.equal(
          true
        );
        result[0].parsedSequence.sequence.toLowerCase().should.equal(
          "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
        );
        result[0].parsedSequence.features.should.containSubset([
          {
            start: 299,
            end: 399,
            name: "fwdFeature"
          }
        ]);
        done();
      },
      {
        fileName: "GFPuv_025_fwdfeature_circular.dna"
      }
    );
  });
  it("linear dna w/feature on reverse strand", function(done) {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_revfeature_linear.dna")
    );
    snapgeneToJson(
      fileObj,
      function(result) {
        result[0].parsedSequence.name.should.equal(
          "GFPuv_025_revfeature_linear"
        );
        result[0].parsedSequence.circular.should.equal(
          false
        );
        result[0].parsedSequence.sequence.toLowerCase().should.equal(
          "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
        );
        result[0].parsedSequence.features.should.containSubset([
          {
            // complement(600..700)
            start: 599,
            end: 699,
            name: "revFeature"
          }
        ]);
        done();
      },
      {
        fileName: "GFPuv_025_revfeature_linear.dna"
      }
    );
  });
  it("circular dna w/feature on reverse strand", function(done) {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/dna/GFPuv_025_revfeature_circular.dna")
    );
    snapgeneToJson(
      fileObj,
      function(result) {
        result[0].parsedSequence.name.should.equal(
          "GFPuv_025_revfeature_circular"
        );
        result[0].parsedSequence.circular.should.equal(
          true
        );
        result[0].parsedSequence.sequence.toLowerCase().should.equal(
          "cagaaagcgtcacaaaagatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgttttgccgtggagcaatgagaacgagccattgagatcatacttacctttgcatgtcactcaaaattttgcctcaaaactgggtgagctgaatttttgcagtaggcatcgtgtaagtttttctagtcggaatgatgatagatcgtaagttatggatggttggcatttgtccagttcatgttatctggggtgttcgtcagtcggtcagcagatccacatagtggttcatctagatcacac"
        );
        result[0].parsedSequence.features.should.containSubset([
          {
            // complement(500..600)
            start: 499,
            end: 599,
            name: "revFeature"
          }
        ]);
        done();
      },
      {
        fileName: "GFPuv_025_revfeature_circular.dna"
      }
    );
  });
});
