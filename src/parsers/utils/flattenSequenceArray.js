var convertOldSequenceDataToNewDataType = require('./convertOldSequenceDataToNewDataType.js');
module.exports = function flattenSequenceArray(parsingResultArray) {
    if (parsingResultArray) {
        if (!Array.isArray(parsingResultArray)) {
            //wrap the parsingResult into an array if it isn't one already
            parsingResultArray = [parsingResultArray];
        }
        //should convert the old data type to the new data type (flattened sequence)
        parsingResultArray.forEach(function(parsingResult) {
            if (parsingResult.success) {
                convertOldSequenceDataToNewDataType(parsingResult.parsedSequence);
            }
        });
    }
    return parsingResultArray;
};