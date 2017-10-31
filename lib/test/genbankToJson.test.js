// var tap = require('tap');
// tap.mochaGlobals();
var genbankToJson = require('../parsers/genbankToJson');
var path = require("path");
var fs = require('fs');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
chai.use(require('chai-things'));
chai.should();

describe('genbankToJson tests', function() {
    it('handles parsing of a protein genbank correctly, making sure not to have too long of feature names', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/proteinTestSeq1.gp'), "utf8");
        var options = {isProtein: true}
        genbankToJson(string, function(result) {
           result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.forEach(function(feat){
                feat.name.length.should.be.below(101);
            });
            // console.log('result',JSON.stringify(result,null,4))
            done();
        }, options);
    });
    it('handles parsing of a protein genbank correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/sequence.gp'), "utf8");
        var options = {isProtein: true}
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.be.length(4);
            
            // console.log('result[0]:',JSON.stringify(result[0],null,4))
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {product: ["Rfp"]},
                name: 'red fluorescent protein',
                start: 0,
                end: 224,
                type: 'protein',
                strand: 1
            });
            done();
        }, options);
    });
    it('handles 1-based feature indices option for both start and end', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/sequence.gp'), "utf8");
        var options = {isProtein: true, inclusive1BasedEnd: true, inclusive1BasedStart: true}
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.be.length(4);
            
            // console.log('result[0]:',JSON.stringify(result[0],null,4))
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {product: ["Rfp"]},
                name: 'red fluorescent protein',
                start: 1,
                end: 225,
                type: 'protein',
                strand: 1
            });
            done();
        }, options);
    });
    it('handles parsing of an oddly spaced genbank without failing', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/breakingGenbank.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.be.length(13);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {},
                name: 'araC',
                start: 6,
                end: 882,
                type: 'CDS',
                strand: -1
            });
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {},
                name: 'T0',
                start: 4300,
                end: 4403,
                type: 'terminator',
                strand: 1
            });
            done();
        });
    });

    it('parses a genbank with just feature start locations correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/rhaBp-Pfu-pUN_alt.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.containSubset([{
                name: 'mutation',
                start: 264,
                end: 264,
            },{
                name: 'TSS',
                start: 291,
                end: 291,
            }]);
            done();
        });
    });

    it('parses a genbank that is implicitly non-circular as circular because it contains circular features', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/Ecoli_DERA_Implicitly_Circular.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.circular.should.equal(true);
            result[0].parsedSequence.features.should.containSubset([{
                name: 'rhaBADp',
                start: 410,
                end: 182,
            }]);
            done();
        });
    });

    it('parses a genbank that is implicitly linear and has no circular features as linear', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/Ecoli_DERA_Implicitly_Linear.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.circular.should.equal(false);
            done();
        });
    });

    it('parses plasmid with run-on feature note (pBbS0c-RFP.gb) correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/pBbS0c-RFP.gb'), "utf8");
        genbankToJson(string, function(result) {
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    note: [
                        "REP_ORIGIN REP_ORIGIN pSC101* aka pMPP6, gives plasmid number 3 -4 copies per cell, BglII site in pSC101* ori has been dele ted by quick change agatcT changed to agatcA giving pSC101* * pSC101* aka pMPP6, gives plasmid number 3-4copies p er cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101** [pBbS0a-RFP]",
                        "pSC101* aka pMPP6, gives plasmid number 3-4 copies per cell, BglII site in pSC101* ori has been deleted by quic k change agatcT changed to agatcA giving pSC101**"
                    ],
                    gene: ["SC101** Ori"],
                    vntifkey: ["33"]
                },
                name: 'pSC101**',
                start: 1073,
                end: 3301,
                type: 'rep_origin',
                strand: -1
            });
            result.should.be.an('array');
            result.should.be.length(1);
            result[0].parsedSequence.features.should.be.length(5);
            result[0].parsedSequence.circular.should.equal(true);
            result[0].parsedSequence.size.should.equal(4224);
            done();
        });
    });
    it('parses pBbE0c-RFP.gb correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/pBbE0c-RFP.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result.should.be.length(1);
            result[0].parsedSequence.features.should.be.length(4);
            result[0].parsedSequence.circular.should.equal(true);
            result[0].parsedSequence.size.should.equal(2815);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    note: ["GENE [ZFP-GG destination LacUV5 p15A CmR]", "[ZFP-GG destination LacUV5 p15A CmR]"],
                    vntifkey: ["22"],
                    gene: ["CmR"]
                },
                name: 'CmR',
                start: 2010,
                end: 2669,
                type: 'gene',
                strand: -1
            });
            done();
        });
    });
    it('handles parsing of a multi-seq genbank correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/multi-seq-genbank.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result.should.be.length(4);
            result[0].parsedSequence.features.should.be.length(0);
            result[0].parsedSequence.size.should.equal(109);

            result.forEach(function(innerResult) {
                innerResult.success.should.be.true;
            });
            done();
        });
    });

    it('parses pj5_00001 aka testGenbankFile.gb correctly', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/testGenbankFile.gb'), "utf8");
        genbankToJson(string, function(result) {
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
                end: 1234,
                type: 'misc_feature',
                strand: 1
            });
            result[0].parsedSequence.sequence.length.should.equal(5299);
            done();
        });
    });
    it('parses a .gb file where the feature name is a number', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/featNameIsNumber.gb'), "utf8");
        genbankToJson(string, function(result) {
           result.should.be.an('array');
            result[0].success.should.be.true;
            done();
        });
    });
    it('takes in a snapgene exported sequence and sets its name correctly (instead of "Export" it will use the filename)', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/CCR5_multifrag_insert1.gb'), "utf8");
        genbankToJson(string, function(result) {
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.name.should.equal('CCR5_multifrag_insert1')
            done();
        }, {fileName: 'CCR5_multifrag_insert1.gb'});
    });
    it('parses a .gb file with tags on parts', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/genbank/gbFileWithTagsOnParts.gb'), "utf8");
        genbankToJson(string, function(result) {
           result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    pragma: ['Teselagen_Part'],
                    preferred3PrimeOverhangs: [''],
                    preferred5PrimeOverhangs: [''],
                    tag: ['blue', 'red']
                },
                name: 'pS8c-gfpuv',
                start: 1238,
                end: 1234,
                type: 'misc_feature',
                strand: 1
            });
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    pragma: ['Teselagen_Part'],
                    preferred3PrimeOverhangs: [''],
                    preferred5PrimeOverhangs: [''],
                    tag: ['red', 'green']
                },
                name: 'pS8c-gfpuv_sig_pep_vector_backbone',
                start: 1238,
                end: 1234,
                type: 'misc_feature',
                strand: 1
            });
            done();
        });
    });

});
// var string = fs.readFileSync(path.join(__dirname, '../../../..', './testData/genbank (JBEI Private)/46.gb'), "utf8");
// var string = fs.readFileSync(__dirname + '/testGenbankFile.gb', "utf8");

// var string = fs.readFileSync(path.join(__dirname, '../../../..', './testData/genbank (JBEI Private)/46.gb'), "utf8");
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
