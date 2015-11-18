var ParserUtil = require('./utils/ParserUtil.js');
// var SbolParser = require('./SbolParser.js');
var validateSequenceArray = require('./utils/validateSequenceArray');
var flattenSequenceArray = require('./utils/flattenSequenceArray');
/**
 * parses jbei json format to our old teselagen json
 * @param  {string} string       file contents string
 * @param  {string} fileName     filename with optional extension 
 * @param  {function} onFileParsed callback that we pass
 */
module.exports = function JbeiseqToJSON(string, onFileParsedUnwrapped, isProtein) {
    onFileParsed = function(sequences) { //before we call the onFileParsed callback, we need to flatten the sequence, and convert the old sequence data to the new data type
        onFileParsedUnwrapped(validateSequenceArray(flattenSequenceArray(sequences), isProtein));
    };
    var result = {
        success: true,
        messages: [],
        parsedSequence: {
            features: [],
            sequence: []
        }
    };
    try {
        var json = JSON.parse(string);

        function new_Feature() {
            return {
                locations: [],
                notes: {}
            };
        }
        //===============
        // LOCUSKEYWORD
        // If DE file can't be imported - exit with Error
        if (json["de:design"] || json["design"]) {
            errorMsg = ["Import Error: DE Design files can not be imported into Vector Editor.  Please check file."];
            onFileParsed(null, fileName, errorMsg, true);
        }

        var name = json["seq:seq"]["seq:name"];
        var circ = json["seq:seq"]["seq:circular"];
        result.parsedSequence.name = name;
        result.parsedSequence.circular = circ;

        var seq = json["seq:seq"]["seq:sequence"]
        result.parsedSequence.sequence = seq.split('');

        //===============
        // FEATURESKEYWORD

        var features = [];

        var feats = json["seq:seq"]["seq:features"];

        for (var i = 0; i < feats.length; i++) {

            var feat = new_Feature();

            var ft = feats[i]["seq:feature"];

            var locations = [];
            var qualifiers = [];

            var type = ft["seq:type"];
            var complement = ft["seq:complement"];

            feat.type = type;

            //===============
            // LOCATION
            for (var j = 0; j < ft["seq:location"].length; j++) {
                var start = ft["seq:location"][j]["seq:genbankStart"];
                var end = ft["seq:location"][j]["seq:end"];
                // var to = "..";
                var loc = {
                    start: start - 1,
                    end: end
                };
                feat.locations.push(loc);
            }

            //===============
            // ATTRIBUTES -> QUALIFIERS

            feat.notes.label = [ft["seq:label"]];
            for (var j = 0; j < ft["seq:attribute"].length; j++) {
                feat.notes[ft["seq:attribute"][j]["_name"]] = [ft["seq:attribute"][j]["__text"]];
            }

            // POST CALCULATIONS
            var strand;
            if (complement === true) {
                strand = -1;
            }
            else {
                strand = 1;
            }

            feat.strand = strand;

            if (feat.notes.label) {
                feat.name = feat.notes.label[0];
            }
            else if (feat.notes.gene) {
                feat.name = feat.notes.gene[0];
            }
            else {
                feat.name = '';
            }
            result.parsedSequence.features.push(feat);
        }
    }
    catch (e) {
        console.log('e.trace: ' + e.trace);
        //catch any errors and set the result accordingly
        result = {
            success: false,
            messages: ['Import Error: Invalid File']
        };
    }
    onFileParsed(result);
};