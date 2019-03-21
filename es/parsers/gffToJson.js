import gff from '@gmod/gff';
import _ from 'lodash';
import addPromiseOption from './utils/addPromiseOption';

function gffToJson(string, onFileParsed) {
  var arrayOfThings = gff.parseStringSync(string);
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
      var name = _.get(attributes, "ID[0]");
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

export default addPromiseOption(gffToJson);