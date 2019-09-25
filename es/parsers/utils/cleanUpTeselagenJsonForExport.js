import { cloneDeep, forEach } from "lodash";

export default function cleanUpTeselagenJsonForExport(tgJson) {
	var seqData = cloneDeep(tgJson);
	if (!seqData) return seqData;
	delete seqData.cutsites;
	delete seqData.orfs;
	forEach(seqData.translations, function (t) {
		delete t.aminoAcids;
	});
	return seqData;
}