import { tidyUpSequenceData } from 've-sequence-utils';

export default function jsonToFasta(jsonSequence, options) {
  const cleanedData = tidyUpSequenceData(jsonSequence);
  const { name, circular, description, size, sequence } = cleanedData;
  options = options || {};
  // options.reformatSeqName = options.reformatSeqName === false ? false : true;
  let fastaString = "";
  fastaString += `>${name || "Untitled Sequence"}|`;
  fastaString += "|" + size;
  fastaString += description ? "|" + description : "";
  fastaString += "|" + (circular ?  "circular" : "linear");
  fastaString += "\n";
  fastaString += (sequence.match(/.{1,80}/g) || []).join("\n");
  return fastaString;
}
