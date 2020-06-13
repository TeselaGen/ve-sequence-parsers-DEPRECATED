'use strict';

exports.__esModule = true;
// Basically a copy of 'Teselagen.utils.NameUtils' for use within workers.

exports.default = {
	/**
  * Reformat name to replaces whitespace with underscores.
  * @param {string} pName
  * @returns {string} New name.
  */
	reformatName: function reformatName(pName) {
		return pName.toString().replace(/ /g, '_');
	}
};
module.exports = exports['default'];