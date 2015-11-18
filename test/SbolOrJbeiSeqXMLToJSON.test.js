// to test just this file:
// node vede/app/teselagen/parsers/SbolOrJbeiSeqXMLToJSON.test.js
var SbolOrJbeiSeqXMLToJSON = require('../parsers/SbolOrJbeiSeqXMLToJSON');
var path = require("path");
var fs = require('fs');
var chai = require('chai');
chai.use(require('chai-things'));
chai.should();

var addOneFlag = 1; //flag to use to add 1 to annotation starts (hopefully we'll take this flag out soon)
describe('basic xml parsing tests', function(done) {
    it('basic sbol test', function(done) {
        // var string = fs.readFileSync(path.join(__dirname, '../ext_tests/data/sequences/pBbE0c-RFP.xml'), "utf8");
        var string = fs.readFileSync(path.join(__dirname, './testData/pBbE0c-RFP.xml'), "utf8");
        SbolOrJbeiSeqXMLToJSON(string, function(result) {
            result[0].parsedSequence.name.should.equal('pBbE0c-RFP');
            result[0].parsedSequence.circular.should.equal(false);
            result[0].parsedSequence.extraLines.length.should.equal(0);
            result[0].parsedSequence.features.length.should.equal(4);
            result[0].parsedSequence.features.should.include.something.that.deep.equals({
                notes: {
                    'ns2:about': ['public-registry.jbei.org/entry/dc#18302dcf-fae9-40c8-a37a-f0e45dd77a64',
                        'public-registry.jbei.org/entry/sa#ae7eb7e3-be41-4a14-a50d-818de29f9378'
                    ],
                    'ns2:resource': ['http://purl.obolibrary.org/obo/SO_0000296']
                },
                name: "colE1 origin",
                start: 1201,
                end: 1883 + addOneFlag,
                strand: 1,
                type: "misc_feature"
            });
            result[0].parsedSequence.sequence.length.should.equal(2815);
            done();
        });
    });
});
// describe('test of sbol from SBOL site', function (done) {
//     it('tests the parsing of toggle switches', function (done) {
//         var string = fs.readFileSync(path.join(__dirname, './testData/Sbol Website/pIKE_pTAK_toggle_switches.xml'), "utf8");
//         SbolOrJbeiSeqXMLToJSON(string, function(result){
//         });
//     });
// });
// var string = fs.readFileSync(path.join(__dirname, '../../../..', 'testing/sequence_data/sbol/jbei-seq.xml'), "utf8");
// SbolOrJbeiSeqXMLToJSON(string, function (result) {
//  console.log('result', result)
//     assert.equal(result[0].parsedSequence.name, 'signal_pep');
//     assert.equal(result[0].parsedSequence.circular, false);
//     assert.equal(result[0].parsedSequence.extraLines, null);
//     assert.equal(result[0].parsedSequence.features.length, 1);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         console.log('feature', feature);
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'signal_peptide' && feature.start === 0 && feature.end === 63 && feature.type === 'CDS' && feature.strand === 1) {
//             return true;
//         }
//     }).length);
//     // assert.equal(result[0].parsedSequence.sequence.length, 81);
// });
// 
// var string = fs.readFileSync(path.join(__dirname, '../../../..', 'testing/sequence_data/sbol/sbol_example.xml'), "utf8");
// SbolOrJbeiSeqXMLToJSON(string, function (result) {
//  console.log('result', JSON.stringify(result,null,4));
//     assert.equal(result[0].parsedSequence.name, 'pBbS8c-RFP');
//     assert.equal(result[0].parsedSequence.circular, false);
//     assert.equal(result[0].parsedSequence.extraLines, null);
//     assert.equal(result[0].parsedSequence.features.length, 13);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         console.log('feature', feature);
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'pBAD\\promoter' && feature.start === 1160 && feature.end === 1187 && feature.type === 'misc_feature' && feature.strand === 1) { //there is a little bit of weirdness here with the xml2js conversion adding an extra \ character
//             return true;
//         }
//     }).length);
//     assert.equal(result[0].parsedSequence.sequence.length, 5213);
// });
// 
// var string = fs.readFileSync(path.join(__dirname, '../../../..', 'testing/sequence_data/sbol/sbol_example.xml'), "utf8");
// SbolOrJbeiSeqXMLToJSON(string, function (result) {
//  console.log('result', JSON.stringify(result,null,4));
//     assert.equal(result[0].parsedSequence.name, 'pBbS8c-RFP'); 
//     assert.equal(result[0].parsedSequence.circular, false);
//     assert.equal(result[0].parsedSequence.extraLines, null);
//     assert.equal(result[0].parsedSequence.features.length, 13);
//     assert(result[0].parsedSequence.features.filter(function(feature) {
//         console.log('feature', feature);
//         //tnrtodo: add testing of note's parsing
//         //and add more features, not just 1
//         if (feature.name === 'pBAD\\promoter' && feature.start === 1160 && feature.end === 1187 && feature.type === 'misc_feature' && feature.strand === 1) { //there is a little bit of weirdness here with the xml2js conversion adding an extra \ character
//             return true;
//         }
//     }).length);
//     assert.equal(result[0].parsedSequence.sequence.length, 5213);
// });