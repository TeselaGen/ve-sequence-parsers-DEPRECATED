'use strict';

exports.__esModule = true;
exports.default = flattenSequenceArray;

var _convertOldSequenceDataToNewDataType = require('./convertOldSequenceDataToNewDataType.js');

var _convertOldSequenceDataToNewDataType2 = _interopRequireDefault(_convertOldSequenceDataToNewDataType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function flattenSequenceArray(parsingResultArray, opts) {
    if (parsingResultArray) {
        if (!Array.isArray(parsingResultArray)) {
            //wrap the parsingResult into an array if it isn't one already
            parsingResultArray = [parsingResultArray];
        }
        //should convert the old data type to the new data type (flattened sequence)
        parsingResultArray.forEach(function (parsingResult) {
            if (parsingResult.success) {
                (0, _convertOldSequenceDataToNewDataType2.default)(parsingResult.parsedSequence, opts);
            }
        });
    }
    return parsingResultArray;
};
module.exports = exports['default'];