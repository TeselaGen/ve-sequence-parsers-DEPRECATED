var parseGenbank = require('../parsers/genbankToJson');
var jsonToGenbank = require('../parsers/jsonToGenbank');
var path = require("path");
var fs = require('fs');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
chai.use(require('chai-things'));
chai.should();
describe('genbank exporter/parser conversion', function() {
    it('should parse notes that come in as a JSON stringified object correctly', function() {
        // var breakingJSON = require('./testData/json/breakingJSON_stringified')
        var breakingJSON = require('./testData/json/1.json')
        var string = jsonToGenbank(breakingJSON)
        parseGenbank(string,function (result) {
            result[0].parsedSequence.features[0].notes.should.to.not.be.null
        })
    })
    
    it('can interconvert between our parser and our exporter with a malformed genbank', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/breakingGenbank.gb'), "utf8");
        parseGenbank(string, function(result) {
            var feat1 = {
                notes: {},
                name: 'araC',
                start: 6,
                end: 882,
                type: 'CDS',
                strand: -1
            }
            var feat2 = {
                notes: {},
                name: 'T0',
                start: 4300,
                end: 4403,
                type: 'terminator',
                strand: 1
            }
            result.should.be.an('array');
            result[0].success.should.be.true;
            result[0].parsedSequence.features.should.be.length(13);
            result[0].parsedSequence.features.should.include.something.that.deep.equals(feat1);
            result[0].parsedSequence.features.should.include.something.that.deep.equals(feat2);
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
            parseGenbank(exportedGenbankString, function(result) {
                result.should.be.an('array');
                result[0].success.should.be.true;
                result[0].parsedSequence.features.should.be.length(13);
                
                result[0].parsedSequence.features.should.include.something.that.deep.equals(feat1);
                result[0].parsedSequence.features.should.include.something.that.deep.equals(feat2);
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
                end: 1234,
                type: 'misc_feature',
                strand: 1
            });
            result[0].parsedSequence.sequence.length.should.equal(5299);
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
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
                    end: 1234,
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
                end: 264,
            },{
                name: 'TSS',
                start: 291,
                end: 291,
            }]);
            var exportedGenbankString = jsonToGenbank(result[0].parsedSequence);
            parseGenbank(exportedGenbankString, function(result) {
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
    });
    it('handles features in an array or a keyed object', function(done) {
        var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
          features: {
            'feat1': {start: 2, end: 4}
          }
        });
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.features.should.containSubset([{
                start: 2,
                end: 4,
            }]);
            done();
        });
    });
    it('handles inclusive1BasedStart and inclusive1BasedEnd options', function(done) {
        var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
          features: {
            'feat1': {start: 2, end: 4}
          }
        }, {
          inclusive1BasedStart: true,
          inclusive1BasedEnd: true,
        });
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.features.should.containSubset([{
                start: 1,
                end: 3,
            }]);
            done();
        });
    });
    it('gives genbank that is linear when circular is falsy', function(done) {
        var exportedGenbankString = jsonToGenbank({
          sequence: 'gagagagagga', 
          circular: false
        });
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.circular.should.be.false
            done();
        });
    });
    it('gives genbank that is linear when sequence.circular="0"', function(done) {
        var exportedGenbankString = jsonToGenbank({
          sequence: 'gagagagagga', 
          circular: "0"
        });
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.circular.should.be.false
            done();
        })
    })
    it('handles reformatSeqName=false option', function(done) {
        var name = '$%^@#'
        var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
          name: name
        }, {
          reformatSeqName: false
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.name.should.equal(name)
            done();
        }, {reformatSeqName: false});
    });
    // it('handles reformatSeqName=true (this is on by default) option', function(done) {
    //     var name = '$%^@#'
    //     var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
    //       name: name
    //     }, {
    //       reformatSeqName: true
    //     })
    //     parseGenbank(exportedGenbankString, function(result) {
    //         result[0].parsedSequence.name.should.equal('_____')
    //         done();
    //     },{reformatSeqName: false});
    // });
    it('does not reformat a name with parens in it', function(done) {
        var name = 'aaa(aaa)'
        var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
          name: name
        }, {
          reformatSeqName: true
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.name.should.equal(name)
            done();
        },{reformatSeqName: false});
    });
    it('provides a default name if none is provided', function(done) {
        var exportedGenbankString = jsonToGenbank({sequence: 'gagagagagga', 
        }, {
          reformatSeqName: true
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.name.should.equal('Untitled_Sequence')
            parseGenbank(jsonToGenbank({sequence: 'gagagagagga'}), function(result) {
                result[0].parsedSequence.name.should.equal('Untitled_Sequence')
                done();
            });
        });
    });
    it('adds a comment with the words teselagen_unique_id: XXXX if given a .teselagen_unique_id property', function(done) {
        var exportedGenbankString = jsonToGenbank({
            sequence: 'gagagagagga', 
            teselagen_unique_id: 'gaslgawlgiubawg;12312asdf', 
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.teselagen_unique_id.should.equal('gaslgawlgiubawg;12312asdf')
            done()
        });
    });
    it('adds a comment for the library field if the sequence has one', function(done) {
        var exportedGenbankString = jsonToGenbank({
            sequence: 'gagagagagga', 
            library: 'libraryField', 
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.library.should.equal('libraryField')
            done()
        });
    });
    it('adds a comment for the description if the sequence has one', function(done) {
        var exportedGenbankString = jsonToGenbank({
            sequence: 'gagagagagga', 
            description: 'my sequence description', 
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.description.should.equal('my sequence description')
            done()
        });
    });
    it('handles comments parsing and formatting', function(done) {
        var exportedGenbankString = jsonToGenbank({
            sequence: 'gagagagagga', 
            comments: ['gaslgawlgiubawg;12312asdf', 'I am alive!'], 
        })
        parseGenbank(exportedGenbankString, function(result) {
            result[0].parsedSequence.comments.length.should.equal(2)
            result[0].parsedSequence.comments[0].should.equal('gaslgawlgiubawg;12312asdf')
            result[0].parsedSequence.comments[1].should.equal('I am alive!')
            done()
        });
    });
});
    
