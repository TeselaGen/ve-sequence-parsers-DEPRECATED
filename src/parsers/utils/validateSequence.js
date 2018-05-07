const areNonNegativeIntegers = require('validate.io-nonnegative-integer-array');
const {FeatureTypes} = require('ve-sequence-utils');
const NameUtils = require('./NameUtils.js');

const {filterAminoAcidSequenceString, filterSequenceString, guessIfSequenceIsDnaAndNotProtein} = require('ve-sequence-utils');
//validation checking
/**
 * validation and sanitizing of our teselagen sequence data type
 * @param  {object} sequence Our teselagen sequence data type
 * @return response         {
    validatedAndCleanedSequence: {},
    messages: [],
  };
 */
module.exports = function validateSequence(sequence, {
    isProtein,
    guessIfProtein,
    guessIfProteinOptions,
    reformatSeqName,
    inclusive1BasedStart,
    inclusive1BasedEnd,
    additionalValidChars,
    acceptParts
}={}) {
    

    const response = {
        validatedAndCleanedSequence: {},
        messages: []
    };
    if (!sequence || typeof sequence !== 'object') {
        throw new Error('Invalid sequence');
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
    const oldName = sequence.name;
    if (reformatSeqName) {
      sequence.name = NameUtils.reformatName(sequence.name)
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
    let validChars;
    if (guessIfProtein) {
        isProtein = !guessIfSequenceIsDnaAndNotProtein(sequence.sequence, guessIfProteinOptions)
    }
    if (isProtein) {
        //tnr: add code to strip invalid protein data..
        validChars = filterAminoAcidSequenceString(sequence.sequence);
        if (validChars !== sequence.sequence) {
            sequence.sequence = validChars;
            response.messages.push("Import Error: Illegal character(s) detected and removed from amino acid sequence. Allowed characters are: xtgalmfwkqespvicyhrndu");
        }
        sequence.type = 'PROTEIN';
    } else {
        //todo: this logic won't catch every case of RNA, so we should probably handle RNA conversion at another level..
        let newSeq =sequence.sequence.replace(/u/g,'t');
        newSeq = newSeq.replace(/U/g,'T');
        if (newSeq !== sequence.sequence) {
            sequence.type = 'RNA';
            sequence.sequence = newSeq;
        } else {
            sequence.type = 'DNA';
        }

        validChars = filterSequenceString(sequence.sequence, additionalValidChars);
        if (validChars !== sequence.sequence) {
            sequence.sequence = validChars;
            response.messages.push("Import Error: Illegal character(s) detected and removed from sequence. Allowed characters are: atgcyrswkmbvdhn");
        }
    }

    if (!sequence.size) {
        sequence.size = sequence.sequence.length;
    }
    let circularityExplicitlyDefined;
    if (sequence.circular === false || sequence.circular === 'false' || sequence.circular === -1) {
        sequence.circular = false;
    } else if (!sequence.circular) {
        sequence.circular = false;
        circularityExplicitlyDefined = false;
    }
    else {
        sequence.circular = true;
    }

    if (!sequence.features || !Array.isArray(sequence.features)) {
        response.messages.push('No valid features detected');
        sequence.features = [];
    }
    //tnr: maybe this should be wrapped in its own function (in case we want to use it elsewhere)
    sequence.features = sequence.features.filter(function(feature) {
        if (!feature || typeof feature !== 'object') {
            response.messages.push('Invalid feature detected and removed');
            return false;
        }
        feature.start = parseInt(feature.start, 10);
        feature.end = parseInt(feature.end, 10);

        if (!feature.name || typeof feature.name !== 'string') {
            response.messages.push('Unable to detect valid name for feature, setting name to "Untitled Feature"');
            feature.name = 'Untitled Feature';
        }
        if (!areNonNegativeIntegers([feature.start]) || feature.start > (sequence.size - (inclusive1BasedStart ? 0 : 1))) {
            response.messages.push('Invalid feature start: ' + feature.start + ' detected for ' + feature.name + ' and set to 1'); //setting it to 0 internally, but users will see it as 1
            feature.start = 0;
        }
        if (!areNonNegativeIntegers([feature.end]) || feature.end > (sequence.size - (inclusive1BasedEnd ? 0 : 1))) {
            response.messages.push('Invalid feature end:  ' + feature.end + ' detected for ' + feature.name + ' and set to 1'); //setting it to 0 internally, but users will see it as 1
            feature.end = Math.max(sequence.size - 1, (inclusive1BasedEnd ? 0 : 1));
            // feature.end = 0;
        }

        if ((feature.start - (inclusive1BasedStart ? 0 : 1))  > (feature.end - (inclusive1BasedEnd ? 0 : 1)) && sequence.circular === false) {
            if (circularityExplicitlyDefined) {
                response.messages.push('Invalid circular feature detected in explicitly linear sequence. ' + feature.name + '. start set to 1'); //setting it to 0 internally, but users will see it as 1
                feature.start = 0;
            } else {
                response.messages.push('Circular feature detected in implicitly linear sequence. Setting sequence to be circular.'); 
                sequence.circular = true;
            }
        }

        feature.strand = parseInt(feature.strand, 10);
        if (feature.strand === -1 || feature.strand === false || feature.strand === 'false' || feature.strand === '-') {
            feature.strand = -1;
        }
        else {
            feature.strand = 1;
        }
        let invalidFeatureType;
        if (!feature.type || typeof feature.type !== 'string' || !FeatureTypes.some(function(featureType) {
                if (featureType.toLowerCase() === feature.type.toLowerCase()) {
                    feature.type = featureType; //this makes sure the feature.type is being set to the exact value of the accepted featureType
                    return true;
                }
                return false
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
        }
        else if (feature.notes.gene) {
            //gene was useds for name (if it existed)
            delete feature.notes.gene;
        } else if (feature.notes.name) {
            //name was used for name (if it existed)
            delete feature.notes.name;
        }
        if (acceptParts && feature.notes.pragma && feature.notes.pragma[0] === "Teselagen_Part") {
            if (!sequence.parts) {
                sequence.parts = [] //initialize an empty array if necessary
            }
            feature.type = "part"
            sequence.parts.push(feature)
            return false //don't include the features 
        }
        return true;
    });
    response.validatedAndCleanedSequence = sequence;
    return response;
};
