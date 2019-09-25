"use strict";

exports.__esModule = true;
exports.default = cleanUpTeselagenJsonForExport;

var _lodash = require("lodash");

function cleanUpTeselagenJsonForExport(tgJson) {
	var seqData = (0, _lodash.cloneDeep)(tgJson);
	if (!seqData) return seqData;
	delete seqData.cutsites;
	delete seqData.orfs;
	(0, _lodash.forEach)(seqData.translations, function (t) {
		delete t.aminoAcids;
	});
	return seqData;
}
module.exports = exports["default"];