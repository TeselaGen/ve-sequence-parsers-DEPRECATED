// Basically a copy of 'Teselagen.utils.NameUtils' for use within workers.

var NameUtils = {
	/**
	 * Reformat name to replaces whitespace with underscores.
	 * @param {String} pName
	 * @returns {String} New name.
	 */
	reformatName: function(pName) {
		return pName.toString().replace(/ /g, '_');
	},
};
module.exports = NameUtils;

