"use strict";

exports.__esModule = true;
exports.default = extractFileExtension;
function extractFileExtension(name) {
	if (typeof name === 'string') {
		var ext = "";
		var match = name.match(/\.(\w+)$/);
		if (match && match[1]) {
			ext = match[1];
		}
		return ext;
	} else {
		return "";
	}
};
module.exports = exports["default"];