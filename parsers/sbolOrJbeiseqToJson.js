var parseString = require('xml2js').parseString;
var flatmap = require('flatmap');
var access = require('safe-access');
var waldo = require('waldojs');
var validateSequenceArray = require('./utils/validateSequenceArray');

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success: 
// }
module.exports = function sbolOrJbeiseqToJsonString(string, onFileParsedUnwrapped, options) {
    onFileParsed = function(sequences) { //before we call the onFileParsed callback, we need to validate the sequence
        onFileParsedUnwrapped(validateSequenceArray(sequences, options));
    };
    var response = {
        parsedSequence: null,
        messages: [],
        success: true
    };
    parseString(string, function(err, result) {
        if (err) {
            onFileParsed({
                success: false,
                messages: ('Error parsing XML to JSON')
            });
            return;
        }
        // console.log('parse xml result', result);
        var jbeiJsonMatches = waldo.byName('seq:seq', result);
        // console.log('jbeiJson', jbeiJsonMatches);
        var sbolJsonMatches = waldo.byName('DnaComponent', result);
        // console.log('ASGASHADHEHEHAERH');
        // console.log('sbolJson', sbolJsonMatches);
        // console.log('ASGASHADHEHEHAERH');
        if (jbeiJsonMatches[0]) { //check if the file matches jbei format
            try {
                response.parsedSequence = parseJbeiJson(jbeiJsonMatches[0].value);
            } catch (e) {
                console.warn('e.trace', e.trace);
                onFileParsed({
                    success: false,
                    messages: ('Error while parsing Jbei format')
                });
            }
            onFileParsed(response);
        } else if (sbolJsonMatches[0]) {
            var resultArray = [];
            for (var i = 0; i < sbolJsonMatches[0].value.length; i++) {
                try {
                    response = {
                        parsedSequence: null,
                        messages: [],
                        success: true
                    };
                    response.parsedSequence = parseSbolJson(sbolJsonMatches[0].value[i]);
                } catch (e) {
                    console.warn('e.trace', e.trace);
                    resultArray.push({
                        success: false,
                        messages: ('Error while parsing Sbol format')
                    });
                }
                if (response.parsedSequence.features.length > 0) {
                    response.messages.push('SBOL feature types are stored in feature notes');
                }
                resultArray.push(response);
            }
            onFileParsed(resultArray);
        } else {
            onFileParsed({
                success: false,
                messages: ('XML is not valid Jbei or Sbol format')
            });
        }
    });
};
// Converts SBOL formats.
//  * Specifications for SBOL can be found at http://www.sbolstandard.org/specification/core-data-model
//  *
//  * The hierarcy of the components in an SBOL object is:
//  *
//  *          The hierarchy is Collection -> DnaComponent -> DnaSequence
//  *
//  * Check for each level and parse downward from there.
// tnrtodo: this should be tested with a wider variety of sbol file types!
function parseSbolJson(sbolJson) {
    // console.log('sbolJson', JSON.stringify(sbolJson, null, 4));
    var name;
    if (access(sbolJson, 'name[0]')) {
        name = access(sbolJson, 'name[0]');
    } else {
        name = access(sbolJson, 'displayId[0]');
    }
    return {
        // circular: access(sbolJson, "seq:circular[0]"), //tnrtodo this needs to be changed
        circular: false,
        sequence: access(sbolJson, 'dnaSequence[0].DnaSequence[0].nucleotides'),
        name: name,
        features: flatmap(sbolJson.annotation, function(annotation) {
            var feature = access(annotation, 'SequenceAnnotation[0]');
            if (feature) {
                var notes = waldo.byName('ns2:about', feature);
                var otherNotes = waldo.byName('ns2:resource', feature);
                notes.push.apply(notes, otherNotes);
                var newNotes = {};
                notes.forEach(function(note) {
                    if (newNotes[note.prop]) {
                        newNotes[note.prop].push(note.value);
                    } else {
                        newNotes[note.prop] = [note.value];
                    }
                });
                var featureName;
                var nameMatches = waldo.byName('name', feature);
                if (nameMatches[0] && nameMatches[0].value && nameMatches[0].value[0]) {
                    featureName = nameMatches[0].value[0];
                } else {
                    var displayMatches = waldo.byName('displayId', feature);
                    if (displayMatches[0] && displayMatches[0].value && displayMatches[0].value[0]) {
                        // console.log('displayMatches[0].value', displayMatches[0].value);
                        featureName = displayMatches[0].value[0];
                    }
                }
                return {
                    name: featureName,
                    notes: newNotes,
                    type: 'misc_feature', // sbol represents the feature type in what we are parsing as notes as the URL is difficult to follow
                    // type: feature['seq:label'], //tnrtodo: figure out if an annotation type is passed
                    // id: feature['seq:label'],
                    start: parseInt(access(feature, 'bioStart[0]') - 1),
                    end: parseInt(access(feature, 'bioEnd[0]')), //tnrtodo: add a -1 here once we convert end from bioEnd to 0-based
                    strand: access(feature, 'strand[0]') //+ or -
                        // notes: feature['seq:label'],
                };
            }
        })
    };
}

function parseJbeiJson(jbeiJson) {
    // console.log('jbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJsonjbeiJson');
    // console.log(JSON.stringify(jbeiJson, null, 4));
    // console.log('hammy', JSON.stringify(jbeiJson['seq:features'], null, 4));
    var features = [];
    var matches = waldo.byName('seq:feature', jbeiJson);
    if (matches[0]) {
        // console.log('hiet');
        features = matches[0].value;
        // console.log('features', features);
    }
    return {
        circular: access(jbeiJson, "seq:circular[0]"),
        sequence: access(jbeiJson, "seq:sequence[0]"),
        name: access(jbeiJson, "seq:name[0]"),
        features: flatmap(features, function(feature) {
            // var feature = access(jbeiFeature, "seq:feature[0]");
            return feature['seq:location'].map(function(location) {
                // console.log('type:::', access(feature, "seq:type[0]"));
                return {
                    name: access(feature, "seq:label[0]"),
                    type: access(feature, "seq:type[0]"),
                    // id: featureseq:label,
                    start: parseInt(access(location, "seq:genbankStart[0]")) - 1,
                    end: parseInt(access(location, "seq:end[0]")), //tnrtodo: add a -1 here once we convert end from bioEnd to 0-based
                    strand: access(feature, "seq:complement[0]") === "true" ? -1 : 1
                        // notes: feature['seq:label'],
                };
            });
        })
    };
}