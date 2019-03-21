'use strict';

exports.__esModule = true;

var _gff = require('@gmod/gff');

var _gff2 = _interopRequireDefault(_gff);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _addPromiseOption = require('./utils/addPromiseOption');

var _addPromiseOption2 = _interopRequireDefault(_addPromiseOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gffToJson(string, onFileParsed) {
  var arrayOfThings = _gff2.default.parseStringSync(string);
  var results = [];
  var sequences = [];
  var features = {};
  arrayOfThings.forEach(function (featureOrSeq) {
    if (featureOrSeq.sequence) {
      sequences.push(featureOrSeq);
    } else {
      var feature = featureOrSeq[0];
      if (!features[feature.seq_id]) features[feature.seq_id] = [];
      var attributes = feature.attributes || {};
      var name = _lodash2.default.get(attributes, "ID[0]");
      features[feature.seq_id].push({
        name: name,
        start: feature.start,
        end: feature.end,
        strand: feature.strand === "+" ? 1 : -1,
        type: feature.type
      });
    }
  });
  sequences.forEach(function (sequence) {
    var sequenceId = sequence.id;
    var result = {
      messages: [],
      success: true,
      parsedSequence: {
        name: sequenceId,
        sequence: sequence.sequence,
        circular: false,
        features: features[sequence.id]
      }
    };
    results.push(result);
  });
  onFileParsed(results);
}

exports.default = (0, _addPromiseOption2.default)(gffToJson);
module.exports = exports['default'];