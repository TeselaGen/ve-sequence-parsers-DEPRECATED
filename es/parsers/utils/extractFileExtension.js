module.exports = function extractFileExtension(name) {
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