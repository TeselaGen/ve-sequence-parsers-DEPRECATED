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
module.exports = function sbolXmlToJson(string, onFileParsedUnwrapped, options) {
    options = options || {};
    var onFileParsed = function onFileParsed(sequences) {
        //before we call the onFileParsed callback, we need to validate the sequence
        onFileParsedUnwrapped(validateSequenceArray(sequences, options));
    };
    var response = {
        parsedSequence: null,
        messages: [],
        success: true
    };
    try {
        parseString(string, function (err, result) {
            if (err) {
                onFileParsed({
                    success: false,
                    messages: 'Error parsing XML to JSON'
                });
                return;
            }
            var sbolJsonMatches = waldo.byName('DnaComponent', result);
            if (sbolJsonMatches[0]) {
                var resultArray = [];
                for (var i = 0; i < sbolJsonMatches[0].value.length; i++) {
                    try {
                        response = {
                            parsedSequence: null,
                            messages: [],
                            success: true
                        };
                        response.parsedSequence = parseSbolJson(sbolJsonMatches[0].value[i], options);
                    } catch (e) {
                        console.error('error:', e);
                        console.error('error.stack: ', e.stack);
                        resultArray.push({
                            success: false,
                            messages: 'Error while parsing Sbol format'
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
                    messages: 'XML is not valid Jbei or Sbol format'
                });
            }
        });
    } catch (e) {
        onFileParsed({
            success: false,
            messages: 'Error parsing XML to JSON'
        });
    }
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
function parseSbolJson(sbolJson, options) {
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
        features: flatmap(sbolJson.annotation, function (annotation) {
            var feature = access(annotation, 'SequenceAnnotation[0]');
            if (feature) {
                var notes = waldo.byName('ns2:about', feature);
                var otherNotes = waldo.byName('ns2:resource', feature);
                notes.push.apply(notes, otherNotes);
                var newNotes = {};
                notes.forEach(function (note) {
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
                    start: parseInt(access(feature, 'bioStart[0]') - (options.inclusive1BasedStart ? 0 : 1)),
                    end: parseInt(access(feature, 'bioEnd[0]') - (options.inclusive1BasedEnd ? 0 : 1)),
                    strand: access(feature, 'strand[0]') //+ or -
                    // notes: feature['seq:label'],
                };
            }
        })
    };
}