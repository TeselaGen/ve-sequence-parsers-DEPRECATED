// var tap = require('tap');
// tap.mochaGlobals();
/**
 * testing file for the FASTA parser, which should be able to handle multiple sequences in the same file, comments, and any other sort of vaild FASTA format
 * @author Joshua P Nixon
 */
var FastaToJSON = require('../parsers/FastaToJSON');
var path = require("path");
var fs = require('fs');
var chai = require('chai');
chai.use(require('chai-things'));
chai.should();

describe('FASTA tests', function() {
    it('tests a basic fasta file', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/fasta/example.fas'), "utf8");
        FastaToJSON(string, function(result) {
            result[0].parsedSequence.name.should.equal('ssrA_tag_enhance');
            result[0].parsedSequence.sequence.should.equal('GTAAGT');
            done();
        });
    });
    it('test a multiFASTA', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/fasta/multi_test.fas'), "utf8");
        debugger;
        FastaToJSON(string, function(result) {
            result.length.should.equal(7);
            result.should.include.something.that.deep.equals({
                parsedSequence: {
                    sequence: 'GTCA',
                    features: [],
                    name: 'Sequence_5',
                    extraLines: [],
                    size: 4,
                    circular: false,
                    type: 'DNA'
                },
                success: true,
                messages: []
            });
            result.should.include.something.that.deep.equals({
                parsedSequence: {
                    name: 'Sequence_1',
                    sequence: 'ACTG',
                    size: 4,
                    circular: false,
                    extraLines: [],
                    features: [],
                    type: 'DNA'
                },
                success: true,
                messages: []
            });
            result.should.include.something.that.deep.equals({
                parsedSequence: {
                    name: 'Sequence_7',
                    sequence: 'GTCA',
                    size: 4,
                    extraLines: [],
                    circular: false,
                    features: [],
                    type: 'DNA'
                },
                success: true,
                messages: []
            });
            done();
        });
    });
    it('tests an old-style FASTA', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/fasta/oldstyle.fas'), "utf8");
        FastaToJSON(string, function(result) {
            result[0].parsedSequence.sequence.should.equal('actGacgata');
            result[0].parsedSequence.name.should.equal('my_NAME'); // TODO: should bars be allowed? they have meaning (though the meaning is not consistent across all FASTA files)
            done();
        });
    });
    it('tests FASTA with a large single line', function(done) {
        var string = fs.readFileSync(path.join(__dirname, './testData/fasta/pBbS8c_RFP.fas'), "utf8");
        FastaToJSON(string, function(result) {
            result[0].parsedSequence.sequence.length.should.equal(5213);
            done();
        });
    });
});