//this test takes a sequence represented in several different file types and 
//makes sure that they give the same results regardless (for fields that make sense)
var anyToJSON = require('../parsers/anyToJSON.js');
var fs = require('fs');
var path = require("path");
var async = require('async');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-things'));
chai.should();

var addOneFlag = 1; //flag to use to add 1 to annotation starts (hopefully we'll take this flag out soon)
describe('anyToJSON', function(argument) {
    it('parses the pBbE0c-RFP plasmid represented in various filetypes to the same end result', function(done) {
        var options = {
            fastaFilePath: "pBbE0c-RFP.fasta",
            genbankFilePath: 'pBbE0c-RFP.gb',
            sbolFilePath: 'pBbE0c-RFP.xml',
            jbeiFilePath: 'pBbE0c-RFP.seq'
        };
        runTest(done, options);
    });
    it('parses the pBbS0c-RFP plasmid represented in various filetypes to the same end result', function(done) {
        var options = {
            fastaFilePath: "pBbS0c-RFP.fasta",
            genbankFilePath: 'pBbS0c-RFP.gb',
            sbolFilePath: 'pBbS0c-RFP.xml',
            jbeiFilePath: 'pBbS0c-RFP.seq'
        };
        runTest(done, options);
    });
});

function runTest(done, options) {
    var fastaResult;
    var genbankResult;
    var jbeiXMLResult;
    var sbolXMLResult;
    async.series([
            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.fastaFilePath), "utf8");
                anyToJSON(string, function(result) {
                    fastaResult = result;
                    done();
                }, {fileName: options.fastaFilePath, isProtein: false});
            },
            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.genbankFilePath), "utf8");
                anyToJSON(string, function(result) {
                    genbankResult = result;
                    done();
                }, {fileName: options.genbankFilePath, isProtein: false});
            },

            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.sbolFilePath), "utf8");
                anyToJSON(string, function(result) {
                    sbolXMLResult = result;
                    done();
                }, {fileName: options.sbolFilePath, isProtein: false});
            },


            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.jbeiFilePath), "utf8");
                anyToJSON(string, function(result) {
                    jbeiXMLResult = result;
                    done();
                }, {fileName: options.jbeiFilePath, isProtein: false});
            },

        ],
        function() {
            //fasta to genbank check
            fastaResult[0].parsedSequence.sequence.should.equal(genbankResult[0].parsedSequence.sequence);

            //jbei xml to genbank check
            jbeiXMLResult[0].parsedSequence.features.length.should.equal(genbankResult[0].parsedSequence.features.length);
            jbeiXMLResult[0].parsedSequence.circular.should.equal(genbankResult[0].parsedSequence.circular);
            jbeiXMLResult[0].parsedSequence.sequence.toLowerCase().should.equal(genbankResult[0].parsedSequence.sequence.toLowerCase());

            // console.log('JSON.stringify(jbeiXMLResult,null,4): ' + JSON.stringify(jbeiXMLResult,null,4));
            // console.log('JSON.stringify(genbankResult,null,4): ' + JSON.stringify(genbankResult,null,4));
            jbeiXMLResult[0].parsedSequence.features.forEach(function(feat1, index) {
                assert(genbankResult[0].parsedSequence.features.filter(function(feat2) {
                    // result[0].parsedSequence.features.should.include.something.that.deep.equals({
                    //     notes:{
                    //         translation: ['GSKVYGKEQFLRMRQSMFPDR'],
                    //         fake: ['blahblah']
                    //     },
                    //     name: 'signal_peptide',
                    //     start: 0,
                    //     end: 62 + addOneFlag,
                    //     type: 'CDS',
                    //     strand: 1
                    // });
                    if (feat1.name === feat2.name) {
                        if (feat1.name === feat2.name && feat1.type === feat2.type && feat1.start === feat2.start && feat1.end === feat2.end && feat1.strand === feat2.strand) {
                            return true;
                        }
                    }

                }).length);
            });
            
            sbolXMLResult[0].parsedSequence.features.length.should.equal(genbankResult[0].parsedSequence.features.length);
            // sbolXMLResult[0].parsedSequence.circular.should.equal(genbankResult[0].parsedSequence.circular);
            sbolXMLResult[0].parsedSequence.sequence.toLowerCase().should.equal(genbankResult[0].parsedSequence.sequence.toLowerCase());
            //sbolXml to genbank check
            //can't make checks for circularity because sbol sequences are assumed to be linear
            // assert(sbolXMLResult[0].parsedSequence.circular === genbankResult[0].parsedSequence.circular);
            sbolXMLResult[0].parsedSequence.features.forEach(function(feat1) {
                assert(genbankResult[0].parsedSequence.features.filter(function(feat2) {
                    //can't make checks for start or end because features are split on the origin in sbol
                    if (feat1.name === feat2.name) {
                        if (feat1.start === 0 && feat1.end === 0 + addOneFlag) {
                            return true;
                        }
                        if (feat1.start === feat2.start && feat1.end === feat2.end) {
                            return true;
                        }
                    }
                }).length);
            });
            done();
        }
    );
}