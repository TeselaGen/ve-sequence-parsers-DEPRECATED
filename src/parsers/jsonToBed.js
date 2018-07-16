const { tidyUpSequenceData } = require('ve-sequence-utils');
const { each } = require('lodash');
const fs = require('fs');

function jsonToBed(jsonSequence, options) {
  const cleanedData = tidyUpSequenceData(jsonSequence);
  const { name, features } = cleanedData;
  // const { name, features } = cleanedData[0].parsedSequence;
  options = options || {};
  let outString = ""
  outString += `track name="${name}" description="${name} Annotations" itemRgb="On"\n`
  const sequenceName = name;

  features.forEach(function(feat) {
    // options.reformatSeqName = options.reformatSeqName === false ? false : true;
    const {start, end, name, type, forward} = feat
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    outString+=`${sequenceName}\t${start}\t${end + 1}\t${type}\t1000\t${forward ? "+" : "-"}\t${start}\t${end + 1}\t65,105,225\n`
  })
  // const filePath = "./src/parsers/AcsBmutJsonToBed.bed";
  // fs.writeFileSync(filePath, outString)
  return outString;
}

module.exports = jsonToBed;