'use strict';

exports.__esModule = true;
exports.default = validateSequenceArray;

var _validateSequence = require('./validateSequence.js');

var _validateSequence2 = _interopRequireDefault(_validateSequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateSequenceArray(parsingResultArray, options) {
    if (parsingResultArray) {
        if (!Array.isArray(parsingResultArray)) {
            //wrap the parsingResult into an array if it isn't one already
            parsingResultArray = [parsingResultArray];
        }
        //should convert the old data type to the new data type (flattened sequence)
        parsingResultArray.forEach(function (parsingResult) {
            if (parsingResult.success) {
                var res = (0, _validateSequence2.default)(parsingResult.parsedSequence, options);
                //add any validation error messages to the parsed sequence results messages
                parsingResult.messages = parsingResult.messages.concat(res.messages);
                parsingResult.parsedSequence = res.validatedAndCleanedSequence;
            }
        });
    }
    return parsingResultArray;
};
module.exports = exports['default'];