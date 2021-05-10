import { tidyUpSequenceData } from "ve-sequence-utils";

export default function jsonToFasta(jsonSequence, options) {
  const cleanedData = tidyUpSequenceData(jsonSequence);
  const {
    name,
    circular,
    description,
    size,
    sequence,
    isProtein,
    proteinSize,
    proteinSequence,
  } = cleanedData;

  options = options || {};
  let seqToUse = sequence;
  let sizeToUse = size;
  if (isProtein && proteinSequence) {
    seqToUse = proteinSequence;
    sizeToUse = proteinSize;
  }
  // options.reformatSeqName = options.reformatSeqName === false ? false : true;
  let fastaString = "";
  fastaString += `>${name || "Untitled Sequence"}|`;
  fastaString += "|" + sizeToUse;
  fastaString += description ? "|" + description : "";
  fastaString += "|" + (circular ? "circular" : "linear");
  fastaString += "\n";
  fastaString += (seqToUse.match(/.{1,80}/g) || []).join("\n");
  return fastaString;
}
