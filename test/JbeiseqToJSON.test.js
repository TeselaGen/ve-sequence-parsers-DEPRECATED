var JbeiseqToJSON = require('../parsers/JbeiseqToJSON');
var path = require("path");
var fs = require('fs');
var chai = require('chai');
chai.use(require('chai-things'));
chai.should();
var addOneFlag = 1; 

describe('JbeiseqToJSON', function (argument) {
    it('correctly parses a test jbei json file', function  (done) {
        var string = fs.readFileSync(path.join(__dirname, "testData/jbeiseq/test.jbeiseq.json"),"utf8");
        JbeiseqToJSON(string, function(result) {
            result[0].parsedSequence.name.should.equal('signal_pep');
            result[0].parsedSequence.circular.should.equal(false);
            result[0].parsedSequence.extraLines.length.should.equal(0);
            result[0].parsedSequence.features.length.should.equal(3);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes:{
                    translation: ['GSKVYGKEQFLRMRQSMFPDR'],
                    fake: ['blahblah']
                },
                name: 'signal_peptide',
                start: 0,
                end: 62 + addOneFlag,
                type: 'CDS',
                strand: 1
            });
            result[0].parsedSequence.sequence.length.should.equal(81);
            done();
        });
    });
});