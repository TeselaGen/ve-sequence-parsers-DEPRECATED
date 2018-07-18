var _require = require('ve-sequence-utils'),
    tidyUpSequenceData = _require.tidyUpSequenceData;

function jsonToBed(jsonSequence, options) {
  var cleanedData = tidyUpSequenceData(jsonSequence);
  var name = cleanedData.name,
      features = cleanedData.features,
      size = cleanedData.size,
      description = cleanedData.description,
      circular = cleanedData.circular;

  options = options || {};

  var sequenceNameToMatchFasta = "";
  sequenceNameToMatchFasta += (name || "Untitled Sequence") + "|";
  sequenceNameToMatchFasta += "|" + size;
  sequenceNameToMatchFasta += description ? "|" + description : "";
  sequenceNameToMatchFasta += "|" + (circular ? "circular" : "linear");
  var outString = "";
  outString += "track name=\"" + sequenceNameToMatchFasta + "\" description=\"" + name + " Annotations\" itemRgb=\"On\"\n";

  features.forEach(function (feat) {
    var start = feat.start,
        end = feat.end,
        type = feat.type,
        forward = feat.forward;
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature

    outString += sequenceNameToMatchFasta + "\t" + start + "\t" + (end + 1) + "\t" + type + "\t1000\t" + (forward ? "+" : "-") + "\t" + start + "\t" + (end + 1) + "\t65,105,225\n";
  });
  return outString;
}

module.exports = jsonToBed;