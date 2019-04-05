import { tidyUpSequenceData } from 've-sequence-utils';

export default function jsonToFasta(jsonSequence, options) {
  var cleanedData = tidyUpSequenceData(jsonSequence);
  var name = cleanedData.name,
      circular = cleanedData.circular,
      description = cleanedData.description,
      size = cleanedData.size,
      sequence = cleanedData.sequence;

  options = options || {};
  // options.reformatSeqName = options.reformatSeqName === false ? false : true;
  var fastaString = "";
  fastaString += ">" + (name || "Untitled Sequence") + "|";
  fastaString += "|" + size;
  fastaString += description ? "|" + description : "";
  fastaString += "|" + (circular ? "circular" : "linear");
  fastaString += "\n";
  fastaString += (sequence.match(/.{1,80}/g) || []).join("\n");
  return fastaString;
}