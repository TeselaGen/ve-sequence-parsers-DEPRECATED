const chai = require("chai");
const jsonToBed = require("../parsers/jsonToBed");

chai.should();
describe("json to bed parser", function() {
  it("should correctly make a bed file", function() {
    const jsonInfo = require("./testData/json/AcsBmut-3pCRISPRi-242.json");
    const bedInfo = jsonToBed(jsonInfo);
    // bedInfo.should.equal("track name="AcsBmut-3pCRISPR" description="AcsBmut-3pCRISPR Annotations" itemRgb="On"
    // AcsBmut-3pCRISPR	0	82	misc_feature	1000	-	0	82	65,105,225
    // AcsBmut-3pCRISPR	8	62	terminator	1000	-	8	62	65,105,225
    // AcsBmut-3pCRISPR	62	80	primer_bind	1000	-	62	80	65,105,225
    // AcsBmut-3pCRISPR	62	80	primer_bind	1000	-	62	80	65,105,225
    // AcsBmut-3pCRISPR	62	80	primer_bind	1000	-	62	80	65,105,225
    // AcsBmut-3pCRISPR	62	80	misc_feature	1000	-	62	80	65,105,225
    // AcsBmut-3pCRISPR	80	86	misc_feature	1000	-	80	86	65,105,225
    // AcsBmut-3pCRISPR	82	645	misc_feature	1000	-	82	645	65,105,225");
  });
});
