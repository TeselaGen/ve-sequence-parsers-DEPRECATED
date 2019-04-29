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
    const { start, end, name, type, forward, strand } = feat;
    let label;
    if (name && type) {
      label = `${name}/${type}`;
    } else if (name) {
      label = name;
    } else {
      label = type;
    }
    let orientation;
    if (forward || strand === 1) {
      orientation = "+";
    } else if (!forward || strand === -1) {
      orientation = "-";
    } else {
      // "." = no strand
      orientation = ".";
    }
    // chromStart is 0-based, chromEnd of the BED file format is not included in the feature
    outString += `${sequenceNameToUse}\t${start}\t${end +
      1}\t${label}\t1000\t${orientation}\t${start}\t${start}\t65,105,225\n`;
  });
  return outString;
}

export default jsonToBed;
