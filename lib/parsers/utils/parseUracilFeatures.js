"use strict";

exports.__esModule = true;
exports.default = parseUracilFeatures;
function parseUracilFeatures(sequenceBps) {
  var featureList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var cleanedBps = sequenceBps.replace(/u/gi, function (u, index) {
    featureList.push({
      type: "misc_feature",
      name: "tg_uracil",
      strand: 1,
      start: index,
      end: index
    });
    return u === "U" ? "T" : "t";
  });
  return cleanedBps;
}
module.exports = exports["default"];