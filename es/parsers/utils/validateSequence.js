var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var areNonNegativeIntegers = require('validate.io-nonnegative-integer-array');
var FeatureTypes = require('./GenbankFeatureTypes.js');
var NameUtils = require('./NameUtils.js');

var _require = require('ve-sequence-utils'),
    filterAminoAcidSequenceString = _require.filterAminoAcidSequenceString,
    filterSequenceString = _require.filterSequenceString;
//validation checking
/**
 * validation and sanitizing of our teselagen sequence data type
 * @param  {object} sequence Our teselagen sequence data type
 * @return response         {
    validatedAndCleanedSequence: {},
    messages: [],
  };
 */


module.exports = function validateSequence(sequence, options) {
    options = options || {};
    var isProtein = options.isProtein || false;
    var reformatSeqName = options.reformatSeqName;

    var response = {
        validatedAndCleanedSequence: {},
        messages: []
    };
    if (!sequence || (typeof sequence === 'undefined' ? 'undefined' : _typeof(sequence)) !== 'object') {
        throw 'Invalid sequence';
    }
    if (!sequence.name) {
        //we'll handle transferring the file name outside of this function
        //for now just set it to a blank string
        sequence.name = '';
    }
    if (!sequence.extraLines) {
        sequence.extraLines = [];
    }
    if (!sequence.comments) {
        sequence.comments = [];
    }
    var oldName = sequence.name;
    if (reformatSeqName) {
        sequence.name = NameUtils.reformatName(sequence.name);
    }
    if (oldName !== sequence.name) {
        response.messages.push('Name (' + oldName + ') reformatted to ' + sequence.name);
    }

    if (Array.isArray(sequence.sequence)) {
        sequence.sequence = sequence.sequence.join('');
    }
    if (!sequence.sequence) {
        response.messages.push('No sequence detected');
        sequence.sequence = '';
    }
    var validChars;
    if (isProtein) {
        //tnr: add code to strip invalid protein data..
        validChars = filterAminoAcidSequenceString(sequence.sequence);
        if (validChars !== sequence.sequence) {
            sequence.sequence = validChars;
            response.messages.push("Import Error: Illegal character(s) detected and removed from amino acid sequence. Allowed characters are: galmfwkqespvicyhrnd");
        }
    } else {
        //todo: this logic won't catch every case of RNA, so we should probably handle RNA conversion at another level..
        var newSeq = sequence.sequence.replace(/u/g, 't');
        newSeq = newSeq.replace(/U/g, 'T');
        if (newSeq !== sequence.sequence) {
            sequence.type = 'RNA';
            sequence.sequence = newSeq;
        } else {
            sequence.type = 'DNA';
        }

        validChars = filterSequenceString(sequence.sequence);
        if (validChars !== sequence.sequence) {
            sequence.sequence = validChars;
            response.messages.push("Import Error: Illegal character(s) detected and removed from sequence. Allowed characters are: atgcyrswkmbvdhn");
        }
    }

    if (!sequence.size) {
        sequence.size = sequence.sequence.length;
    }
    var circularityExplicitlyDefined;
    if (sequence.circular === false || sequence.circular == 'false' || sequence.circular === -1) {
        sequence.circular = false;
    } else if (!sequence.circular) {
        sequence.circular = false;
        circularityExplicitlyDefined = false;
    } else {
        sequence.circular = true;
    }

    if (!sequence.features || !Array.isArray(sequence.features)) {
        response.messages.push('No valid features detected');
        sequence.features = [];
    }
    //tnr: maybe this should be wrapped in its own function (in case we want to use it elsewhere)
    sequence.features = sequence.features.filter(function (feature) {
        if (!feature || (typeof feature === 'undefined' ? 'undefined' : _typeof(feature)) !== 'object') {
            response.messages.push('Invalid feature detected and removed');
            return false;
        }
        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);

        if (!feature.name || typeof feature.name !== 'string') {
            response.messages.push('Unable to detect valid name for feature, setting name to "Untitled Feature"');
            feature.name = 'Untitled Feature';
        }
        if (!areNonNegativeIntegers([feature.start]) || feature.start > sequence.size - (options.inclusive1BasedStart ? 0 : 1)) {
            response.messages.push('Invalid feature start: ' + feature.start + ' detected for ' + feature.name + ' and set to 1'); //setting it to 0 internally, but users will see it as 1
            feature.start = 0;
        }
        if (!areNonNegativeIntegers([feature.end]) || feature.end > sequence.size - (options.inclusive1BasedEnd ? 0 : 1)) {
            response.messages.push('Invalid feature end:  ' + feature.end + ' detected for ' + feature.name + ' and set to 1'); //setting it to 0 internally, but users will see it as 1
            feature.end = 0;
        }

        if (feature.start - (options.inclusive1BasedStart ? 0 : 1) > feature.end - (options.inclusive1BasedEnd ? 0 : 1) && sequence.circular === false) {
            if (circularityExplicitlyDefined) {
                response.messages.push('Invalid circular feature detected in explicitly linear sequence. ' + feature.name + '. start set to 1'); //setting it to 0 internally, but users will see it as 1
                feature.start = 0;
            } else {
                response.messages.push('Circular feature detected in implicitly linear sequence. Setting sequence to be circular.');
                sequence.circular = true;
            }
        }

        feature.strand = parseInt(feature.strand);
        if (feature.strand === -1 || feature.strand === false || feature.strand === 'false' || feature.strand === '-') {
            feature.strand = -1;
        } else {
            feature.strand = 1;
        }
        var invalidFeatureType;
        if (!feature.type || typeof feature.type !== 'string' || !FeatureTypes.some(function (featureType) {
            if (featureType.toLowerCase() === feature.type.toLowerCase()) {
                feature.type = featureType; //this makes sure the feature.type is being set to the exact value of the accepted featureType
                return true;
            }
        })) {
            response.messages.push('Invalid feature type detected:  "' + feature.type + '" within ' + feature.name + '. set type to misc_feature');
            if (typeof feature.type === 'string') {
                invalidFeatureType = feature.type;
            }
            feature.type = 'misc_feature';
        }
        if (!feature.notes) {
            feature.notes = {};
        }
        //if the original feature type was invalid, push it onto the notes object under featureType
        if (invalidFeatureType) {
            if (!feature.notes.featureType) {
                feature.notes.featureType = [];
            }
            feature.notes.featureType.push(invalidFeatureType);
        }
        if (feature.notes.label) {
            //we've already used the label as the name by default if both gene and label were present
            delete feature.notes.label;
        } else if (feature.notes.gene) {
            //gene was useds for name (if it existed)
            delete feature.notes.gene;
        } else if (feature.notes.name) {
            //name was used for name (if it existed)
            delete feature.notes.name;
        }
        return true;
    });
    response.validatedAndCleanedSequence = sequence;
    return response;
};