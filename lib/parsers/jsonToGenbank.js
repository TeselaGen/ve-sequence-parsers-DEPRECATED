"use strict";

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-disable no-var*/


exports.default = function (_serSeq, options) {
  options = options || {};
  options.reformatSeqName = options.reformatSeqName !== false;
  var serSeq = (0, _lodash.cloneDeep)(_serSeq);
  if (!serSeq) return false;

  try {
    if (serSeq.isProtein || serSeq.type === "protein" || serSeq.type === "AA") {
      serSeq.isProtein = true;
      serSeq.sequence = serSeq.proteinSequence || serSeq.sequence;
      options.isProtein = true;
    }
    var content = null;
    var cutUp = typeof serSeq.sequence === "string" ? cutUpStr : cutUpArray;
    if (!serSeq.sequence) serSeq.sequence = "";

    var lines = [];
    lines.push(createGenbankLocus(serSeq, options));
    if (serSeq.definition || serSeq.description) {
      lines.push("DEFINITION  " + (serSeq.definition || serSeq.description));
    }

    if (serSeq.extraLines) {
      lines = lines.concat(serSeq.extraLines);
    }
    if (serSeq.comments) {
      serSeq.comments.forEach(function (comment) {
        lines.push("COMMENT             " + comment);
      });
    }
    if (serSeq.teselagen_unique_id) {
      lines.push("COMMENT             teselagen_unique_id: " + serSeq.teselagen_unique_id);
    }
    if (serSeq.library) {
      lines.push("COMMENT             library: " + serSeq.library);
    }

    serSeq.features = (0, _lodash.map)(serSeq.features).concat((0, _lodash.flatMap)(_pragmasAndTypes2.default, function (_ref) {
      var pragma = _ref.pragma,
          type = _ref.type;

      return (0, _lodash.flatMap)(serSeq[type], function (ann) {
        if (!(0, _lodash.isObject)(ann)) {
          return [];
        }
        ann.notes = pragma ? _extends({}, ann.notes, {
          pragma: [pragma]
        }) : ann.notes;
        return ann;
      });
    }));

    var printedFeatureHeader = void 0;
    (0, _lodash.each)(serSeq.features, function (feat, index) {
      if (!printedFeatureHeader) {
        printedFeatureHeader = true;
        lines.push("FEATURES             Location/Qualifiers");
      }
      lines.push(featureToGenbankString(feat, options));
    });

    lines.push("ORIGIN      ");
    for (var i = 0; i < serSeq.sequence.length; i = i + 60) {
      var line = [];
      var ind = StringUtil.lpad("" + (i + 1), " ", 9);
      line.push(ind);

      for (var j = i; j < i + 60; j = j + 10) {
        // line.push(serSeq.sequence.slice(j,j+10).join(''));
        line.push(cutUp(serSeq.sequence, j, j + 10));
      }
      lines.push(line.join(" "));
    }

    lines.push("//");

    content = lines.join("\r\n");
    // return cb(err, content);
    return content;
  } catch (e) {
    console.warn("Error processing sequence << Check jsonToGenbank.js");
    console.warn(serSeq);
    console.warn(e.stack);
    return false;
  }
};

var _lodash = require("lodash");

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

var _NameUtils = require("./utils/NameUtils.js");

var _NameUtils2 = _interopRequireDefault(_NameUtils);

var _pragmasAndTypes = require("./utils/pragmasAndTypes.js");

var _pragmasAndTypes2 = _interopRequireDefault(_pragmasAndTypes);

var _veSequenceUtils = require("ve-sequence-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StringUtil = {
  /** Trims white space at beginning and end of string
   * @param {string} line
   * @returns {string} line
   */
  trim: function trim(line) {
    return line.replace(/^\s+|\s+$/g, "");
  },

  /** Trims white space at beginning string
   * @param {string} line
   * @returns {string} line
   */
  ltrim: function ltrim(line) {
    return line.replace(/^\s+/, "");
  },

  /** Trims white space at end of string
   * @param {string} line
   * @returns {string} line
   */
  rtrim: function rtrim(line) {
    return line.replace(/\s+$/, "");
  },

  /** Pads white space at beginning of string
   * @param {string} line
   * @returns {string} line
   */
  lpad: function lpad(line, padString, length) {
    var str = line;
    while (str.length < length) {
      str = padString + str;
    }return str;
  },

  /** Pads white space at end of string
   * @param {string} line
   * @returns {string} line
   */
  rpad: function rpad(line, padString, length) {
    var str = line;
    while (str.length < length) {
      str = str + padString;
    }return str;
  }
};

function cutUpArray(val, start, end) {
  return val.slice(start, end).join("");
}

function cutUpStr(val, start, end) {
  return val.slice(start, end);
}

function createGenbankLocus(serSeq, options) {
  if (serSeq.sequence.symbols) {
    serSeq.sequence = serSeq.sequence.symbols.split("");
  }

  var tmp = void 0;
  var dnaType = void 0;
  if (serSeq.isProtein) {
    dnaType = "";
  } else if (serSeq.type === "RNA") {
    dnaType = "RNA";
  } else {
    dnaType = "DNA";
  }
  var date = getCurrentDateString();

  var line = StringUtil.rpad("LOCUS", " ", 12);
  var nameToUse = serSeq.name || "Untitled_Sequence";
  nameToUse = options.reformatSeqName ? _NameUtils2.default.reformatName(nameToUse) : nameToUse;
  line += StringUtil.rpad(nameToUse, " ", 16);
  line += " "; // T.H line 2778 of GenbankFormat.as col 29 space
  line += StringUtil.lpad(String(serSeq.sequence.length), " ", 11);
  line += serSeq.isProtein ? " aa " : " bp "; // col 41
  // if (strandType !== "") {
  // 	tmp =  strandType + "-";
  // } else {
  tmp = "";
  // }
  line += StringUtil.lpad(tmp, " ", 3);
  line += StringUtil.rpad(dnaType, " ", 6);
  line += "  ";

  if (!serSeq.circular || serSeq.circular === "0") {
    line += "linear  ";
    //line += "        ";
  } else {
    line += "circular";
  }

  line += " "; //col 64
  if (serSeq.gbDivision) {
    line += StringUtil.rpad(serSeq.gbDivision || "SYN", " ", 10);
  }
  // }
  line += " "; // col 68
  // DOES NOT PARSE DATE USEFULLY ORIGINALLY!
  line += date;
  //line += "\n";

  return line;
}

function getCurrentDateString() {
  var date = new Date();
  date = date.toString().split(" ");
  var day = date[2];
  var month = date[1].toUpperCase();
  var year = date[3];
  return day + "-" + month + "-" + year;
}

function featureNoteInDataToGenbankString(name, value) {
  return StringUtil.lpad("/", " ", 22) + name + '="' + value + '"';
}

function featureToGenbankString(feat, options) {
  var lines = [];

  var line = "     " + StringUtil.rpad(feat.type || "misc_feature", " ", 16);
  var locStr = "";

  //for(var i=0;i<feat.locations.length;i++) {
  //	var loc = feat.locations[i];
  //	locStr.push((loc.start+1) + '..' + loc.end);
  //}

  if (feat.locations && feat.locations.length > 1) {
    feat.locations.forEach(function (loc, i) {
      locStr += getProteinStart(parseInt(loc.start, 10) + (options.inclusive1BasedStart ? 0 : 1), options.isProtein) + ".." + getProteinEnd(parseInt(loc.end, 10) + (options.inclusive1BasedEnd ? 0 : 1), options.isProtein);

      if (i !== feat.locations.length - 1) {
        locStr += ",";
      }
    });
    locStr = "join(" + locStr + ")";
  } else {
    locStr += getProteinStart(parseInt(feat.start, 10) + (options.inclusive1BasedStart ? 0 : 1), options.isProtein) + ".." + getProteinEnd(parseInt(feat.end, 10) + (options.inclusive1BasedEnd ? 0 : 1), options.isProtein);
  }

  // locStr = locStr.join(",");

  if (feat.strand === -1) {
    locStr = "complement(" + locStr + ")";
  }

  lines.push(line + locStr);

  lines.push(featureNoteInDataToGenbankString("label", feat.name || "Untitled Feature"));

  var notes = feat.notes;
  if (notes) {
    try {
      if (typeof notes === "string") {
        try {
          notes = JSON.parse(notes);
        } catch (e) {
          console.warn("Warning: Note incorrectly sent as a string.");
          notes = {}; //set the notes to a blank object
        }
      }
      Object.keys(notes).forEach(function (key) {
        if (key === "color" || key === "labelColor") return; //we'll handle this below
        if (notes[key] instanceof Array) {
          notes[key].forEach(function (value) {
            lines.push(featureNoteInDataToGenbankString(key, value));
          });
        } else {
          console.warn("Warning: Note object expected array values");
          console.warn(notes);
        }
      });
    } catch (e) {
      console.warn("Warning: Note cannot be processed");
    }
  }
  feat.color = feat.notes && feat.notes.color || feat.color;
  feat.labelColor = feat.notes && feat.notes.labelColor || feat.labelColor;

  if (feat.color && _color2.default.rgb(feat.color).string() !== _color2.default.rgb(_veSequenceUtils.featureColors[feat.type]).string() //don't save a color note if the color is already the same as our defaults
  ) {
      lines.push(featureNoteInDataToGenbankString("color", feat.color));
    }
  if (feat.labelColor) {
    lines.push(featureNoteInDataToGenbankString("labelColor", feat.labelColor));
  }

  return lines.join("\r\n");
}

function getProteinStart(val, isProtein) {
  if (!isProtein) return val;
  return Math.floor((val + 2) / 3);
}
function getProteinEnd(val, isProtein) {
  if (!isProtein) return val;
  return Math.floor(val / 3);
}
module.exports = exports["default"];