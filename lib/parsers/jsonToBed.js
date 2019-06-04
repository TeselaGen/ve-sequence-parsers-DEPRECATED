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
        name = feat.name,
        type = feat.type,
        forward = feat.forward,
        strand = feat.strand;

    var label = name ? name : type;
    var orientation = void 0;
    if (forward || strand === 1) {
      orientation = "+";
    } else if (!forward || strand === -1) {
      orientation = "-";
    } else {
      // "." = no strand
      orientation = ".";
    }
    var color = type === "CDS" ? "230,88,0" : "";
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    // when there is no thick part, thickStart and thickEnd are usually set to the chromStart position
    outString += sequenceNameToUse + "\t" + start + "\t" + (end + 1) + "\t" + label + "\t\t" + orientation + "\t\t\t" + color + "\n";
  });
  return outString;
}

exports.default = jsonToBed;
module.exports = exports["default"];