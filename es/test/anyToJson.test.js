//this test takes a sequence represented in several different file types and
//makes sure that they give the same results regardless (for fields that make sense)
var anyToJson = require('../parsers/anyToJson.js');
var fs = require('fs');
var path = require("path");
var async = require('async');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-things'));
chai.should();

describe('anyToJson', function() {
    it('parses a simple .txt file as fasta', function(done) {
        anyToJson(fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP_no_name.txt'), "utf8"), function(result) {
            result[0].parsedSequence.sequence.length.should.equal(4224)
            result[0].parsedSequence.name.should.equal('pBbS0c-RFP_no_name')
            done();
        }, {fileName: 'pBbS0c-RFP_no_name.txt', isProtein: false});    
    });
    it('parses a .fasta file without a name and use the file name', function(done) {
        anyToJson(fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP_no_name.fasta'), "utf8"), function(result) {
            result[0].parsedSequence.name.should.equal('pBbS0c-RFP_no_name')
            done();
        }, {fileName: 'pBbS0c-RFP_no_name.fasta', isProtein: false});    
    });
    it('should call the success callback for a .txt file only once', function(done) {
        var times = 0
        anyToJson(fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP_no_name.txt'), "utf8"), function() {
            times++
        }, {fileName: 'pBbS0c-RFP_no_name.txt'});    
        setTimeout(function () {
            times.should.equal(1)
            done();
        })
    });
    it('should call the success callback for an ambiguously named file only once', function(done) {
        var times = 0
        anyToJson(fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP_no_name.gb'), "utf8"), function() {
            times++
        }, {fileName: 'pBbS0c-RFP', isProtein: false});    
        setTimeout(function () {
            times.should.equal(1)
            done();
        })
    });
    it('parses the pBbE0c-RFP plasmid represented in various filetypes to the same end result', function(done) {
        var options = {
            fastaFilePath: "pBbE0c-RFP.fasta",
            genbankFilePath: 'pBbE0c-RFP.gb',
            sbolFilePath: 'pBbE0c-RFP.xml',
        };
        runTest(done, options);
    });
    it('parses the pBbS0c-RFP plasmid represented in various filetypes to the same end result', function(done) {
        var options = {
            fastaFilePath: "pBbS0c-RFP.fasta",
            genbankFilePath: 'pBbS0c-RFP.gb',
            sbolFilePath: 'pBbS0c-RFP.xml',
        };
        runTest(done, options);
    });
});

function runTest(done, options) {
    var fastaResult;
    var genbankResult;
    var sbolXMLResult;
    async.series([
            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.fastaFilePath), "utf8");
                anyToJson(string, function(result) {
                    fastaResult = result;
                    done();
                }, {fileName: options.fastaFilePath, isProtein: false});
            },
            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.genbankFilePath), "utf8");
                anyToJson(string, function(result) {
                    genbankResult = result;
                    done();
                }, {fileName: options.genbankFilePath, isProtein: false});
            },

            function(done) {
                var string = fs.readFileSync(path.join(__dirname, './testData/', options.sbolFilePath), "utf8");
                anyToJson(string, function(result) {
                    sbolXMLResult = result;
                    done();
                }, {fileName: options.sbolFilePath, isProtein: false});
            },
        ],
        function() {
            //fasta to genbank check
            fastaResult[0].parsedSequence.sequence.should.equal(genbankResult[0].parsedSequence.sequence);

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
                        if (feat1.start === 0 && feat1.end === 0) {
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
