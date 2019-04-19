"use strict";

exports.__esModule = true;

var _veSequenceUtils = require("ve-sequence-utils");

function jsonToBed(jsonSequence) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var sequenceInfo = options.featuresOnly ? jsonSequence : (0, _veSequenceUtils.tidyUpSequenceData)(jsonSequence);
  var name = sequenceInfo.name,
      features = sequenceInfo.features,
      size = sequenceInfo.size,
      description = sequenceInfo.description,
      circular = sequenceInfo.circular;


  var sequenceNameToMatchFasta = "";
  sequenceNameToMatchFasta += (name || "Untitled Sequence") + "|";
  sequenceNameToMatchFasta += "|" + size;
  sequenceNameToMatchFasta += description ? "|" + description : "";
  sequenceNameToMatchFasta += "|" + (circular ? "circular" : "linear");
  var sequenceNameToUse = options.sequenceName || sequenceNameToMatchFasta;
  var outString = "";
  outString += "track name=\"" + sequenceNameToUse + "\" description=\"" + name + " Annotations\" itemRgb=\"On\"\n";

  features.forEach(function (feat) {
    var start = feat.start,
        end = feat.end,
        type = feat.type,
        forward = feat.forward,
        strand = feat.strand;
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature

    outString += sequenceNameToUse + "\t" + start + "\t" + (end + 1) + "\t" + type + "\t1000\t" + (forward || strand === 1 ? "+" : "-") + "\t" + start + "\t" + (end + 1) + "\t65,105,225\n";
  });
  return outString;
}

exports.default = jsonToBed;
module.exports = exports["default"];