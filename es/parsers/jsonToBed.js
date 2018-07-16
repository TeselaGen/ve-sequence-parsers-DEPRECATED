var _require = require('ve-sequence-utils'),
    tidyUpSequenceData = _require.tidyUpSequenceData;

var _require2 = require('lodash'),
    each = _require2.each;

var fs = require('fs');

function jsonToBed(jsonSequence, options) {
  var cleanedData = tidyUpSequenceData(jsonSequence);
  var name = cleanedData.name,
      features = cleanedData.features;
  // const { name, features } = cleanedData[0].parsedSequence;

  options = options || {};
  var outString = "";
  outString += 'track name="' + name + '" description="' + name + ' Annotations" itemRgb="On"\n';
  var sequenceName = name;

  features.forEach(function (feat) {
    // options.reformatSeqName = options.reformatSeqName === false ? false : true;
    var start = feat.start,
        end = feat.end,
        name = feat.name,
        type = feat.type,
        forward = feat.forward;
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature

    outString += sequenceName + '\t' + start + '\t' + (end + 1) + '\t' + type + '\t1000\t' + (forward ? "+" : "-") + '\t' + start + '\t' + (end + 1) + '\t65,105,225\n';
  });
  // const filePath = "./src/parsers/AcsBmutJsonToBed.bed";
  // fs.writeFileSync(filePath, outString)
  return outString;
}

module.exports = jsonToBed;