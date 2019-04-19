import { tidyUpSequenceData } from "ve-sequence-utils";

function jsonToBed(jsonSequence, options = {}) {
  let sequenceInfo = options.featuresOnly
    ? jsonSequence
    : tidyUpSequenceData(jsonSequence);
  const { name, features, size, description, circular } = sequenceInfo;

  let sequenceNameToMatchFasta = "";
  sequenceNameToMatchFasta += `${name || "Untitled Sequence"}|`;
  sequenceNameToMatchFasta += "|" + size;
  sequenceNameToMatchFasta += description ? "|" + description : "";
  sequenceNameToMatchFasta += "|" + (circular ? "circular" : "linear");
  const sequenceNameToUse = options.sequenceName || sequenceNameToMatchFasta;
  let outString = "";
  outString += `track name="${sequenceNameToUse}" description="${name} Annotations" itemRgb="On"\n`;

  features.forEach(function(feat) {
    const { start, end, type, forward, strand } = feat;
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    outString += `${sequenceNameToUse}\t${start}\t${end + 1}\t${type}\t1000\t${
      forward || strand === 1 ? "+" : "-"
    }\t${start}\t${end + 1}\t65,105,225\n`;
  });
  return outString;
}

export default jsonToBed;
