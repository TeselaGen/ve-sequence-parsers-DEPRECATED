var parseGenbank = require('../parsers/genbankToJSON');
var jsonToGenbank = require('../parsers/jsonToGenbank');
var addOneFlag = 1; //flag to use to add 1 to annotation starts (hopefully we'll take this flag out soon)
var path = require("path");
var fs = require('fs');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
chai.use(require('chai-things'));
chai.should();
describe('genbank exporter/parser conversion', function() {
    it('can interconvert between our parser and our exporter with a malformed genbank', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/breakingGenbank.gb'), "utf8");
        parseGenbank(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.be.length(13);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {},
                name: 'araC',
                start: 6,
                end: 882 + addOneFlag,
                type: 'CDS',
                strand: -1
            });
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {},
                name: 'T0',
                start: 4300,
                end: 4403 + addOneFlag,
                type: 'terminator',
                strand: 1
            });
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
            parseGenbank(exportedGenbankString, function(result) {
                result.should.be.an('array');
                result[0].success.should.be.true;
                result[0].parsedSequence.features.should.be.length(13);
                result[0].parsedSequence.features.should.include.something.that.deep.equals({
                    notes: {},
                    name: 'araC',
                    start: 6,
                    end: 882 + addOneFlag,
                    type: 'CDS',
                    strand: -1
                });
                result[0].parsedSequence.features.should.include.something.that.deep.equals({
                    notes: {},
                    name: 'T0',
                    start: 4300,
                    end: 4403 + addOneFlag,
                    type: 'terminator',
                    strand: 1
                });
                done();
            });
        });
    });

    it('parses and converts pj5_00001 (aka testGenbankFile.gb) correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/testGenbankFile.gb'), "utf8");
        parseGenbank(string, function(result) {
            result[0].parsedSequence.name.should.equal('pj5_00001');
            result[0].parsedSequence.circular.should.equal(true);
            result[0].parsedSequence.extraLines.length.should.equal(3);
            result[0].parsedSequence.features.length.should.equal(21);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    pragma: ['Teselagen_Part'],
                    preferred3PrimeOverhangs: [''],
                    preferred5PrimeOverhangs: ['']
                },
                name: 'pS8c-gfpuv_sig_pep_vector_backbone',
                start: 1238,
                end: 1234 + addOneFlag,
                type: 'misc_feature',
                strand: 1
            });
            result[0].parsedSequence.sequence.length.should.equal(5299);
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
            console.log('exportedGenbankString: ' + exportedGenbankString);
            parseGenbank(exportedGenbankString, function(result) {
                result[0].parsedSequence.name.should.equal('pj5_00001');
                result[0].parsedSequence.circular.should.equal(true);
                result[0].parsedSequence.extraLines.length.should.equal(3);
                result[0].parsedSequence.features.length.should.equal(21);
                result[0].parsedSequence.features.should.include.something.that.deep.equals({
                    notes: {
                        pragma: ['Teselagen_Part'],
                        preferred3PrimeOverhangs: [''],
                        preferred5PrimeOverhangs: ['']
                    },
                    name: 'pS8c-gfpuv_sig_pep_vector_backbone',
                    start: 1238,
                    end: 1234 + addOneFlag,
                    type: 'misc_feature',
                    strand: 1
                });
                result[0].parsedSequence.sequence.length.should.equal(5299);
                done();
            });
        });
    });

    it('parses and converts a genbank with just feature start locations correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/rhaBp-Pfu-pUN_alt.gb'), "utf8");
        parseGenbank(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.containSubset([{
                name: 'mutation',
                start: 264,
                end: 264 + addOneFlag,
            },{
                name: 'TSS',
                start: 291,
                end: 291 + addOneFlag,
            }]);
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
            parseGenbank(exportedGenbankString, function(result) {
                result.should.be.an('array');
                result[0].success.should.be.true;
                result[0].parsedSequence.features.should.containSubset([{
                    name: 'mutation',
                    start: 264,
                    end: 264 + addOneFlag,
                },{
                    name: 'TSS',
                    start: 291,
                    end: 291 + addOneFlag,
                }]);
                done();
            });
        });
    });

    // it('parses a genbank that is implicitly non-circular as circular because it contains circular features', function(done) {
    //     var string = fs.readFileSync(path.join(__dirname, './testData/Ecoli_DERA_Implicitly_Circular.gb'), "utf8");
    //     parseGenbank(string, function(result) {
    //         result.should.be.an('array');
    //         result[0].success.should.be.true;
    //         result[0].parsedSequence.circular.should.equal(true);
    //         result[0].parsedSequence.features.should.containSubset([{
    //             name: 'rhaBADp',
    //             start: 410,
    //             end: 182 + addOneFlag,
    //         }]);
    //         done();
    //     });
    // });

    // it('parses a genbank that is implicitly linear and has no circular featuers as linear', function(done) {
    //     var string = fs.readFileSync(path.join(__dirname, './testData/Ecoli_DERA_Implicitly_Linear.gb'), "utf8");
    //     parseGenbank(string, function(result) {
    //         result.should.be.an('array');
    //         result[0].success.should.be.true;
    //         result[0].parsedSequence.circular.should.equal(false);
    //         done();
    //     });
    // });

    // it('parses plasmid with run-on feature note (pBbS0c-RFP.gb) correctly', function(done) {
    //     var string = fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP.gb'), "utf8");
    //     parseGenbank(string, function(result) {
    //         // console.log('JSON.stringify(result,null,4): ' + JSON.stringify(result,null,4));
    //         result[0].parsedSequence.features.should.include.something.that.deep.equals({
    //             notes: {
    //                 note: [
    //                     "REP_ORIGIN REP_ORIGIN pSC101* aka pMPP6, gives plasmid number 3 -4 copies per cell, BglII site in pSC101* ori has been dele ted by quick change agatcT changed to agatcA giving pSC101* * pSC101* aka pMPP6, gives plasmid number 3-4copies p er cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101** [pBbS0a-RFP]",
    //                     "pSC101* aka pMPP6, gives plasmid number 3-4 copies per cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101**"
    //                 ],
    //                 gene: ["SC101** Ori"],
    //                 vntifkey: ["33"]
    //             },
    //             name: 'pSC101**',
    //             start: 1073,
    //             end: 3301 + addOneFlag,
    //             type: 'rep_origin',
    //             strand: -1
    //         });
    //         result.should.be.an('array');
    //         result.should.be.length(1);
    //         result[0].parsedSequence.features.should.be.length(5);
    //         result[0].parsedSequence.circular.should.equal(true);
    //         // console.log('result: ' + JSON.stringify(result,null,4));
    //         result[0].parsedSequence.size.should.equal(4224);
    //         done();
    //     });
    // });
    // it('parses pBbE0c-RFP.gb correctly', function(done) {
    //     var string = fs.readFileSync(path.join(__dirname, './testData/pBbE0c-RFP.gb'), "utf8");
    //     parseGenbank(string, function(result) {
    //         result.should.be.an('array');
    //         result.should.be.length(1);
    //         result[0].parsedSequence.features.should.be.length(4);
    //         result[0].parsedSequence.circular.should.equal(true);
    //         // console.log('result: ' + JSON.stringify(result,null,4));
    //         result[0].parsedSequence.size.should.equal(2815);
    //         result[0].parsedSequence.features.should.include.something.that.deep.equals({
    //             notes: {
    //                 note: ["GENE [ZFP-GG destination LacUV5 p15A CmR]", "[ZFP-GG destination LacUV5 p15A CmR]"],
    //                 vntifkey: ["22"],
    //                 gene: ["CmR"]
    //             },
    //             name: 'CmR',
    //             start: 2010,
    //             end: 2669 + addOneFlag,
    //             type: 'gene',
    //             strand: -1
    //         });
    //         done();
    //     });
    // });
    // it('handles parsing of a multi-seq genbank correctly', function(done) {
    //     var string = fs.readFileSync(path.join(__dirname, './testData/multi-seq-genbank.gb'), "utf8");
    //     parseGenbank(string, function(result) {
    //         result.should.be.an('array');
    //         result.should.be.length(4);
    //         result[0].parsedSequence.features.should.be.length(0);
    //         // console.log('result: ' + JSON.stringify(result,null,4));
    //         result[0].parsedSequence.size.should.equal(109);

    //         result.forEach(function(innerResult) {
    //             innerResult.success.should.be.true;
    //         });
    //         done();
    //     });
    // });



});
