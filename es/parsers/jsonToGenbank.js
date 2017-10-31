var each = require('lodash/each');
var nameUtils = require('./utils/NameUtils.js');
var StringUtil = {
	/** Trims white space at beginning and end of string
  * @param {String} line
  * @returns {String} line
  */
	trim: function trim(line) {
		return line.replace(/^\s+|\s+$/g, "");
	},

	/** Trims white space at beginning string
  * @param {String} line
  * @returns {String} line
  */
	ltrim: function ltrim(line) {
		return line.replace(/^\s+/, "");
	},

	/** Trims white space at end of string
  * @param {String} line
  * @returns {String} line
  */
	rtrim: function rtrim(line) {
		return line.replace(/\s+$/, "");
	},

	/** Pads white space at beginning of string
  * @param {String} line
  * @returns {String} line
  */
	lpad: function lpad(line, padString, length) {
		var str = line;
		while (str.length < length) {
			str = padString + str;
		}return str;
	},

	/** Pads white space at end of string
  * @param {String} line
  * @returns {String} line
  */
	rpad: function rpad(line, padString, length) {
		var str = line;
		while (str.length < length) {
			str = str + padString;
		}return str;
	}
};

function cutUpArray(val, start, end) {
	return val.slice(start, end).join('');
}

function cutUpStr(val, start, end) {
	return val.slice(start, end);
}

module.exports = function (serSeq, options) {
	options = options || {};
	options.reformatSeqName = options.reformatSeqName === false ? false : true;

	if (!serSeq) return false;

	try {

		var content = null;
		var cutUp = typeof serSeq.sequence === 'string' ? cutUpStr : cutUpArray;
		if (!serSeq.sequence) serSeq.sequence = '';

		var lines = [];
		lines.push(createGenbankLocus(serSeq, options));

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
		if (serSeq.description) {
			lines.push("COMMENT             description: " + serSeq.description);
		}
		var printedFeatureHeader;
		each(serSeq.features, function (feat, index) {
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
			lines.push(line.join(' '));
		}

		lines.push('//');

		content = lines.join('\r\n');
		// return cb(err, content);
		return content;
	} catch (e) {
		console.warn("Error processing sequence << Check jsonToGenbank.js");
		console.warn(serSeq);
		console.warn(e.stack);
		return false;
	}
};

function createGenbankLocus(serSeq, options) {
	if (serSeq.sequence.symbols) {
		serSeq.sequence = serSeq.sequence.symbols.split('');
	}

	var tmp;
	var naType;
	if (serSeq.type === 'protein') {
		naType = 'Protein';
	} else if (serSeq.type === 'RNA') {
		naType = 'RNA';
	} else {
		naType = 'DNA';
	}
	var date = getCurrentDateString();

	var line = StringUtil.rpad("LOCUS", " ", 12);
	var nameToUse = serSeq.name || 'Untitled_Sequence';
	nameToUse = options.reformatSeqName ? nameUtils.reformatName(nameToUse) : nameToUse;
	line += StringUtil.rpad(nameToUse, " ", 16);
	line += " "; // T.H line 2778 of GenbankFormat.as col 29 space
	line += StringUtil.lpad(String(serSeq.sequence.length), " ", 11);
	line += " bp "; // col 41
	// if (strandType !== "") {
	// 	tmp =  strandType + "-";
	// } else {
	tmp = "";
	// }
	line += StringUtil.lpad(tmp, " ", 3);
	line += StringUtil.rpad(naType, " ", 6);
	line += "  ";

	if (!serSeq.circular || serSeq.circular === "0") {
		line += "linear  ";
		//line += "        ";
	} else {
		line += "circular";
	}

	line += " "; //col 64
	// if (divisionCode !== undefined) {
	// 	line += StringUtil.rpad(divisionCode," ", 3);
	// } else {
	StringUtil.rpad(line, " ", 3);
	// }
	line += " "; // col 68
	// DOES NOT PARSE DATE USEFULLY ORIGINALLY!
	line += date;
	//line += "\n";

	return line;
};

function getCurrentDateString() {
	var date = new Date();
	date = date.toString().split(' ');
	var day = date[2];
	var month = date[1].toUpperCase();
	var year = date[3];
	return day + '-' + month + '-' + year;
};

function featureNoteInDataToGenbankString(name, value) {
	return StringUtil.lpad("/", " ", 22) + name + "=\"" + value + "\"";
};

function featureToGenbankString(feat, options) {
	var lines = [];

	var line = "     " + StringUtil.rpad(feat.type || 'misc_feature', " ", 16);
	var locStr = [];

	//for(var i=0;i<feat.locations.length;i++) {
	//	var loc = feat.locations[i];
	//	locStr.push((loc.start+1) + '..' + loc.end);
	//}

	locStr.push(parseInt(feat.start) + (options.inclusive1BasedStart ? 0 : 1) + '..' + (parseInt(feat.end) + (options.inclusive1BasedEnd ? 0 : 1)));

	locStr = locStr.join(',');

	if (feat.strand === -1) {
		locStr = "complement(" + locStr + ")";
	}

	lines.push(line + locStr);

	lines.push(featureNoteInDataToGenbankString('label', feat.name || "Untitled Feature"));

	var notes = feat.notes;
	if (notes) {
		try {
			if (typeof notes === 'string') {
				try {
					notes = JSON.parse(notes);
				} catch (e) {
					console.warn("Warning: Note incorrectly sent as a string.");
					notes = {}; //set the notes to a blank object
				}
			}
			Object.keys(notes).forEach(function (key) {
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

	return lines.join('\r\n');
};