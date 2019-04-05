"use strict";

exports.__esModule = true;
exports.default = jsonToFasta;

var _veSequenceUtils = require("ve-sequence-utils");

function jsonToFasta(jsonSequence, options) {
  var cleanedData = (0, _veSequenceUtils.tidyUpSequenceData)(jsonSequence);
  var name = cleanedData.name,
      circular = cleanedData.circular,
      description = cleanedData.description,
      size = cleanedData.size,
      sequence = cleanedData.sequence;

  options = options || {};
  // options.reformatSeqName = options.reformatSeqName === false ? false : true;
  var fastaString = "";
  fastaString += ">" + (name || "Untitled Sequence") + "|";
  fastaString += "|" + size;
  fastaString += description ? "|" + description : "";
  fastaString += "|" + (circular ? "circular" : "linear");
  fastaString += "\n";
  fastaString += (sequence.match(/.{1,80}/g) || []).join("\n");
  return fastaString;
}
module.exports = exports["default"];