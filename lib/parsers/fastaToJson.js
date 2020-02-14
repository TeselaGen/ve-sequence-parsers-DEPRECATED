'use strict';

exports.__esModule = true;

var _createInitialSequence = require('./utils/createInitialSequence');

var _createInitialSequence2 = _interopRequireDefault(_createInitialSequence);

var _splitStringIntoLines = require('./utils/splitStringIntoLines.js');

var _splitStringIntoLines2 = _interopRequireDefault(_splitStringIntoLines);

var _validateSequenceArray = require('./utils/validateSequenceArray');

var _validateSequenceArray2 = _interopRequireDefault(_validateSequenceArray);

var _addPromiseOption = require('./utils/addPromiseOption');

var _addPromiseOption2 = _interopRequireDefault(_addPromiseOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fastaToJson(fileString, onFileParsedUnwrapped, options) {
    var onFileParsed = function onFileParsed(sequences) {
        //before we call the onFileParsed callback, we want to validate it
        onFileParsedUnwrapped((0, _validateSequenceArray2.default)(sequences, options));
    };
    var resultArray = [];
    var result = null;
    try {
        var lines = (0, _splitStringIntoLines2.default)(fileString);

        for (var i = 0; i < lines.length; i++) {
            parseLine(lines[i]);
        }
        if (result) {
            resultArray.push(result);
            result = null;
        }
    } catch (e) {
        console.error('error:', e);
        console.error('error.stack: ', e.stack);
        resultArray = [{
            success: false,
            messages: ['Import Error: Invalid File']
        }];
    }
    onFileParsed(resultArray);

    function parseLine(line) {
        line = line.trim();
        if (";" === line[0]) {
            //first instace is title, afterwards comments are ignored
            if (result) {
                return;
            }
            result = (0, _createInitialSequence2.default)(options);
            parseTitle(line);
        } else if (">" === line[0]) {
            //header line
            if (result) {
                resultArray.push(result);
                result = null;
            }
            result = (0, _createInitialSequence2.default)(options);
            parseTitle(line);
        } else {
            //sequence line
            if (!result) {
                result = (0, _createInitialSequence2.default)(options);
            }
            if ("*" === line[line.length - 1]) {
                //some resultArray are ended with an asterisk
                parseSequenceLine(line.substring(0, line.length - 1));
                resultArray.push(result);
                result = null;
            } else {
                parseSequenceLine(line);
            }
        }
        if (options && options.parseFastaAsCircular) {
            result.parsedSequence.circular = true;
        }
    }

    function parseTitle(line) {
        var pipeIndex = line.indexOf('|');
        if (pipeIndex > -1) {
            result.parsedSequence.name = line.slice(1, pipeIndex);
            result.parsedSequence.description = line.slice(pipeIndex + 1);
        } else {
            result.parsedSequence.name = line.slice(1);
        }
    }

    function parseSequenceLine(line) {
        // http://www.ncbi.nlm.nih.gov/BLAST/blastcgihelp.shtml says
        // that the sequence can be interspersed with numbers and/or spaces and - dashes for gaps.
        // if (options && !options.doNotRemoveDashes && line.match(/[\s0-9-]/)) {
        //     line = line.replace(/[\s[0-9-]/g, "");
        //     const msg = "Warning: spaces, numbers and/or dashes were removed from sequence"
        //     result.messages.indexOf(msg === -1) && result.messages.push(msg);
        // }
        result.parsedSequence.sequence += line;
    }
}

/**
 * parses a fasta file that may or may not contain multiple resultArray
 * @param  {[string]} fileString   [string respresentation of file contents]
 * @param  {[function]} onFileParsed [callback for a parsed sequence]
 * @author Joshua P Nixon
 */
exports.default = (0, _addPromiseOption2.default)(fastaToJson);
module.exports = exports['default'];