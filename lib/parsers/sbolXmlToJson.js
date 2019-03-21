'use strict';

exports.__esModule = true;

var _xml2js = require('xml2js');

var _flatmap = require('flatmap');

var _flatmap2 = _interopRequireDefault(_flatmap);

var _safeAccess = require('safe-access');

var _safeAccess2 = _interopRequireDefault(_safeAccess);

var _waldojs = require('waldojs');

var _waldojs2 = _interopRequireDefault(_waldojs);

var _validateSequenceArray = require('./utils/validateSequenceArray');

var _validateSequenceArray2 = _interopRequireDefault(_validateSequenceArray);

var _addPromiseOption = require('./utils/addPromiseOption');

var _addPromiseOption2 = _interopRequireDefault(_addPromiseOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success: 
// }
/* eslint-disable no-var*/
function sbolXmlToJson(string, onFileParsedUnwrapped, options) {
    options = options || {};
    var onFileParsed = function onFileParsed(sequences) {
        //before we call the onFileParsed callback, we need to validate the sequence
        onFileParsedUnwrapped((0, _validateSequenceArray2.default)(sequences, options));
    };
    var response = {
        parsedSequence: null,
        messages: [],
        success: true
    };
    try {
        (0, _xml2js.parseString)(string, function (err, result) {
            if (err) {
                onFileParsed({
                    success: false,
                    messages: 'Error parsing XML to JSON'
                });
                return;
            }
            var sbolJsonMatches = _waldojs2.default.byName('DnaComponent', result);
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
}
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
    var name = void 0;
    if ((0, _safeAccess2.default)(sbolJson, 'name[0]')) {
        name = (0, _safeAccess2.default)(sbolJson, 'name[0]');
    } else {
        name = (0, _safeAccess2.default)(sbolJson, 'displayId[0]');
    }
    return {
        // circular: access(sbolJson, "seq:circular[0]"), //tnrtodo this needs to be changed
        circular: false,
        sequence: (0, _safeAccess2.default)(sbolJson, 'dnaSequence[0].DnaSequence[0].nucleotides'),
        name: name,
        features: (0, _flatmap2.default)(sbolJson.annotation, function (annotation) {
            var feature = (0, _safeAccess2.default)(annotation, 'SequenceAnnotation[0]');
            if (feature) {
                var notes = _waldojs2.default.byName('ns2:about', feature);
                var otherNotes = _waldojs2.default.byName('ns2:resource', feature);
                notes.push.apply(notes, otherNotes);
                var newNotes = {};
                notes.forEach(function (note) {
                    if (newNotes[note.prop]) {
                        newNotes[note.prop].push(note.value);
                    } else {
                        newNotes[note.prop] = [note.value];
                    }
                });
                var featureName = void 0;
                var nameMatches = _waldojs2.default.byName('name', feature);
                if (nameMatches[0] && nameMatches[0].value && nameMatches[0].value[0]) {
                    featureName = nameMatches[0].value[0];
                } else {
                    var displayMatches = _waldojs2.default.byName('displayId', feature);
                    if (displayMatches[0] && displayMatches[0].value && displayMatches[0].value[0]) {
                        featureName = displayMatches[0].value[0];
                    }
                }
                return {
                    name: featureName,
                    notes: newNotes,
                    type: 'misc_feature', // sbol represents the feature type in what we are parsing as notes as the URL is difficult to follow
                    // type: feature['seq:label'], //tnrtodo: figure out if an annotation type is passed
                    // id: feature['seq:label'],
                    start: parseInt((0, _safeAccess2.default)(feature, 'bioStart[0]') - (options.inclusive1BasedStart ? 0 : 1)),
                    end: parseInt((0, _safeAccess2.default)(feature, 'bioEnd[0]') - (options.inclusive1BasedEnd ? 0 : 1)),
                    strand: (0, _safeAccess2.default)(feature, 'strand[0]') //+ or -
                    // notes: feature['seq:label'],
                };
            }
        })
    };
}

exports.default = (0, _addPromiseOption2.default)(sbolXmlToJson);
module.exports = exports['default'];