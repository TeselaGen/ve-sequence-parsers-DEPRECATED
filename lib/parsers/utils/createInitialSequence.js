'use strict';

exports.__esModule = true;
exports.default = createInitialSequence;

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createInitialSequence(options) {
    options = options || {};
    return {
        messages: [],
        success: true,
        parsedSequence: {
            features: [],
            name: options.fileName && options.fileName.replace(/\.[^/.]+$/, "") || _constants2.default.untitledSequenceName,
            sequence: ''
        }
    };
};
module.exports = exports['default'];