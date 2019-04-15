import { tidyUpSequenceData } from 've-sequence-utils';

function jsonToBed(jsonSequence, options) {
  const cleanedData = tidyUpSequenceData(jsonSequence);
  const { name, features, size, description, circular } = cleanedData;
  options = options || {};

  let sequenceNameToMatchFasta = "";
  sequenceNameToMatchFasta += `${name || "Untitled Sequence"}|`;
  sequenceNameToMatchFasta += "|" + size;
  sequenceNameToMatchFasta += description ? "|" + description : "";
  sequenceNameToMatchFasta += "|" + (circular ?  "circular" : "linear");
  let outString = "";
  outString += `track name="${sequenceNameToMatchFasta}" description="${name} Annotations" itemRgb="On"\n`

  features.forEach(function(feat) {
    const {start, end, type, forward, strand} = feat
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    outString+=`${sequenceNameToMatchFasta}\t${start}\t${end + 1}\t${type}\t1000\t${forward || strand === 1 ? "+" : "-"}\t${start}\t${end + 1}\t65,105,225\n`
  })
  return outString;
}

export default jsonToBed;