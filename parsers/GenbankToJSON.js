var flattenSequenceArray = require('./utils/flattenSequenceArray');
var validateSequenceArray = require('./utils/validateSequenceArray');
var some = require('lodash/collection/some');
var splitStringIntoLines = require('./utils/splitStringIntoLines.js');
var addOneFlag = 1; //change to 0 when we convert to 0-based indices

function parseGenbankFileToOurOldTeselagenDataType(string, onFileParsedUnwrapped, isProtein) {
    onFileParsed = function(sequences, isProtein) { //before we call the onFileParsed callback, we need to flatten the sequence, and convert the old sequence data to the new data type
        onFileParsedUnwrapped(validateSequenceArray(flattenSequenceArray(sequences), isProtein));
    };
    var resultsArray = [];
    var result;
    var currentFeatureNote;

    var genbankAnnotationKey = {
        LOCUS_TAG: "LOCUS",
        DEFINITION_TAG: "DEFINITION",
        ACCESSION_TAG: "ACCESSION",
        VERSION_TAG: "VERSION",
        KEYWORDS_TAG: "KEYWORDS",
        //SEGMENT_TAG:"SEGMENT"
        SOURCE_TAG: "SOURCE",
        ORGANISM_TAG: "ORGANISM",
        REFERENCE_TAG: "REFERENCE",
        AUTHORS_TAG: "AUTHORS",
        CONSORTIUM_TAG: "CONSRTM",
        TITLE_TAG: "TITLE",
        JOURNAL_TAG: "JOURNAL",
        PUBMED_TAG: "PUBMED",
        REMARK_TAG: "REMARK",
        COMMENT_TAG: "COMMENT",
        FEATURES_TAG: "FEATURES",
        BASE_COUNT_TAG: "BASE COUNT",
        //CONTIG_TAG: "CONTIG"
        ORIGIN_TAG: "ORIGIN",
        END_SEQUENCE_TAG: "//"
    };

    try {
        var lines = splitStringIntoLines(string);
        var LASTTYPE = false;
        var featureLocationIndentation;

        if (lines === null) {
            addMessage("Import Error: Sequence file is empty");
        }

        lines.some(function(line, index) {
            if (line === null) {
                return true; //break the some loop
            }
            var key = getLineKey(line);
            var val = getLineVal(line);
            var isKeyRunon = isKeywordRunon(line);
            var isSubKey = isSubKeyword(line);
            var isKey = isKeyword(line);

            //only set a new lasttype in the case that we've encountered a key that warrants it. 
            if (key === "LOCUS") {
                LASTTYPE = key;
            }
            else if (key === "REFERENCE") {
                LASTTYPE = key;
            }
            else if (key === "FEATURES") {
                LASTTYPE = key;
            }
            else if (key === "ORIGIN") {
                LASTTYPE = key;
            }
            else if (key === "//") {
                LASTTYPE = key;
            }
            else if (isKey === true) {
                LASTTYPE = key;
            }

            // IGNORE LINES: DO NOT EVEN PROCESS
            if (line.trim() === "" || key === ";") {
                //tnr: don't add the following message because it is not particularly informative
                // addMessage(
                //     "Warning: Empty line, or ';' detected. Ignoring line: " +
                //     line);
                return false; // go to next line
            }


            switch (LASTTYPE) {
                case genbankAnnotationKey.LOCUS_TAG:
                    parseLocus(line, key, val);
                    break;
                case genbankAnnotationKey.FEATURES_TAG:
                    //If no location is specified, exclude feature and return messages
                    if (val === "") {
                        addMessage("Warning: The feature '" + key +
                            "'' has no location specified. This line has been ignored: line" +
                            line);
                        break;
                    }
                    parseFeatures(line, key, val);
                    break;
                case genbankAnnotationKey.ORIGIN_TAG:
                    parseOrigin(line, key);
                    break;
                case genbankAnnotationKey.END_SEQUENCE_TAG:
                    endSeq();
                    break;
                case "COMMENT":
                    // do nothing
                    // console.warn("GenbankManager.lineParser(: This line contains a 'COMMENT' and has been ignored: " + line);
                    extractExtraLine(line);
                    break;
                default: // FOLLOWING FOR KEYWORDS NOT PREVIOUSLY DEFINED IN CASES
                    extractExtraLine(line);
                    if (key === "BASE") {
                        // do nothing;              // BLANK LINES || line with ;;;;;;;;;  || "BASE COUNT"
                        // console.warn("Parsing GenBank File: This line with BaseCount has been ignored: " + line);
                        addMessage(
                            "Warning: This BaseCount line has been ignored: " + line);
                        break;
                    }
                    else if (isKey) {
                        // REGULAR KEYWORDS (NOT LOCUS/FEATURES/ORIGIN) eg VERSION, ACCESSION, SOURCE, REFERENCE
                        // lastObj = parseKeyword(line, gb);
                    }
                    else if (isSubKey) { // REGULAR SUBKEYWORD, NOT FEATURE eg AUTHOR, ORGANISM
                        // tmp = gb.getLastKeyword();
                        // lastObj = parseSubKeyword(tmp, line, gb);
                    }
                    else if (isKeyRunon) { // RUNON LINES FOR NON-FEATURES
                        // lastObj.setValue(lastObj.getValue() + Teselagen.StringUtil.rpad("\n"," ",13) + Ext.String.trim(line));
                        // lastObj.appendValue(Teselagen.StringUtil.rpad("\n"," ",13) + Ext.String.trim(line), gb);
                    }
                    else {
                        // console.warn("Parsing GenBank File: This line has been ignored: " + line);
                        addMessage("Warning: This line has been ignored: " + line);
                    }
            }
        });
    }
    catch (e) {
        //catch any errors and set the result
        result = {
            success: false,
            messages: ['Import Error: Invalid File']
        };
    }

    //catch the case where we've successfully started a sequence and parsed it, but endSeq isn't called correctly
    if (result.success &&
        resultsArray[resultsArray.length - 1] !== result) {
        //current result isn't in resultsArray yet
        //so we call endSeq here
        endSeq();
    }
    //call the callback
    onFileParsed(resultsArray, isProtein);

    function newSeq() {
        result = {
            messages: [],
            success: true,
            parsedSequence: {
                features: [],
                name: '',
                // inData: {},
                sequence: ''
            }
        };
    }

    function endSeq() {
        //do some post processing clean-up
        postProcessCurSeq();
        //push the result into the resultsArray
        resultsArray.push(result);
    }

    function getCurrentFeature() {
        return result.parsedSequence.features[result.parsedSequence.features.length - 1];
    }

    function getLastFeatureNote() {
        return currentFeatureNote[currentFeatureNote.length - 1];
    }

    function addMessage(msg) {
        return result.messages.push(msg);
    }

    function postProcessCurSeq() {
        if (result.parsedSequence && result.parsedSequence.features) {
            for (var i = 0; i < result.parsedSequence.features.length; i++) {
                result.parsedSequence.features[i] = postProcessGenbankFeature(result.parsedSequence.features[i]);
            }
        }
    }

    function parseOrigin(line, key) {
        if (key === genbankAnnotationKey.ORIGIN_TAG) {}
        else {
            new_line = line.replace(/[\s]*[0-9]*/g, "");
            result.parsedSequence.sequence += new_line;
        }
    }

    function parseLocus(line, key, val) {
        newSeq();
        var locusName, linear, div, date;
        var lineArr = line.split(/[\s]+/g);

        if (lineArr.length <= 1) {
            console.warn("Parsing GenBank File: WARNING! Locus line contains no values!");
            // TODO
            addMessage("Import Warning: Locus line contains no values: " + line);
        }
        locusName = lineArr[1];

        // Linear vs Circular?; CANNOT HANDLE TANDEM
        linear = true;
        for (i = 1; i < lineArr.length; i++) {
            if (lineArr[i].match(/circular/gi)) {
                linear = false;
            }
        }

        // Date and Div
        // Date is in format:1-APR-2012
        for (i = 1; i < lineArr.length; i++) {
            if (lineArr[i].match(/-[A-Z]{3}-/g)) {
                date = lineArr[i];
            }
            if (lineArr[i].match(/^[A-Z]{3}/g) && lineArr[i].length === 3 && !lineArr[i]
                .match(/DNA|RNA/g)) {
                div = lineArr[i];
            }
        }
        result.parsedSequence.name = locusName;
        result.parsedSequence.circular = !linear;
    }

    function extractExtraLine(line) {
        if (result.parsedSequence) {
            if (!result.parsedSequence.extraLines) {
                result.parsedSequence.extraLines = [];
            }
            result.parsedSequence.extraLines.push(line);
        }
        else {
            throw ('no sequence yet created upon which to extract an extra line!');
        }
    }

    function parseFeatures(line, key, val) {
        var featElm, featQual, lastElm, strand;
        // FOR THE MAIN FEATURES LOCATION/QUALIFIER LINE
        if (key === genbankAnnotationKey.FEATURES_TAG) {
            lastLineWasFeaturesTag = true;
            return;
        }

        if (lastLineWasFeaturesTag) {
            //we need to get the indentation of feature locations
            featureLocationIndentation = getLengthOfWhiteSpaceBeforeStartOfLetters(line);
            //set lastLineWasFeaturesTag to false 
            lastLineWasFeaturesTag = false;
        }

        // FOR LOCATION && QUALIFIER LINES
        if (isFeatureLineRunon(line, featureLocationIndentation)) {
            //the line is a continuation of the above line
            if (lastLineWasLocation) {
                //the last line was a location, so the run-on line is expected to be a feature location as well
                parseFeatureLocation(line.trim());
                lastLineWasLocation = true;
            }
            else {
                //the last line was a note
                if (currentFeatureNote) {
                    //append to the currentFeatureNote
                    currentFeatureNote[currentFeatureNote.length - 1] += line.trim().replace(/\"/g, "");
                }
                lastLineWasLocation = false;
            }
        }
        else { // New Element/Qualifier lines. Not runon lines.
            if (isNote(line)) { // is a new Feature Element (e.g. source, CDS) in the form of  "[\s] KEY  SEQLOCATION"
                // is a FeatureQualifier in the /KEY="BLAH" format; could be multiple per Element
                //Check that feature did not get skipped for missing location
                if (getCurrentFeature()) {
                    parseFeatureNote(line);
                    lastLineWasLocation = false;
                }
                else {
                    return;
                }
            }
            else {
                //the line is a location, so we make a new feature from it
                if (val.match(/complement/g)) {
                    strand = -1;
                }
                else {
                    strand = 1;
                }

                newFeature();
                var feat = getCurrentFeature();
                feat.type = key;
                feat.strand = strand;

                parseFeatureLocation(val);
                lastLineWasLocation = true;
            }
        }

    }

    function newFeature() {
        result.parsedSequence.features.push({
            locations: [],
            notes: {}
        });
    }

    function isNote(line) {
        var qual = false;
        /*if (line.charAt(21) === "/") {//T.H. Hard coded method
           qual = true;
         }*/
        if (line.trim().charAt(0).match(/\//)) { // searches based on looking for / in beginning of line
            qual = true;
        }
        else if (line.match(/^[\s]*\/[\w]+=[\S]+/)) { // searches based on "   /key=BLAH" regex
            qual = true;
        }
        return qual;
    }

    function isQualifierRunon(line) {
        var runon = false;
        //if ( Ext.String.trim(line.substr(0,20)) === ""  && !Ext.String.trim(line).charAt(0).match(/\// ) && !isLocationRunon(line) ) {
        if (line.substr(0, 10).trim() === "" && !line.trim().charAt(0).match(/\//) &&
            !isLocationRunon(line)) {
            runon = true;
        }
        return runon;
    }



    function parseFeatureLocation(locStr) {
        locStr = locStr.trim();
        var locArr = [];
        locStr.replace(/(\d+)/g, function(string, match) {
            locArr.push(match);
        });
        for (var i = 0; i < locArr.length; i += 2) {
            var start = parseInt(locArr[i]) - 1;
            var end = parseInt(locArr[i + 1]) ;
            if (isNaN(end)) { 
                //if no end is supplied, assume that the end should be set to whatever the start is
                //this makes a feature location passed as:
                //147
                //function like:
                //147..147
                end = start + addOneFlag;
            }
            var location = {
                //feature starts are stored in the db as 0-based, start is inclusive and end is exclusive, e.g. [start, end)
                //(see also: Teselagen.manager.SequenceManager) so we must decrease start index by 1 before loading
                start: start,
                end: end
            };
            var feat = getCurrentFeature();
            feat.locations.push(location);
        }
    }

    function parseFeatureNote(line) {
        var newLine, lineArr;

        newLine = line.trim();
        newLine = newLine.replace(/^\/|"$/g, "");
        lineArr = newLine.split(/=\"|=/);

        var quoted = false;
        var val = lineArr[1];

        if (val) {
            val = val.replace(/\\/g, " ");

            if (line.match(/=\"/g)) {
                quoted = true;
                val = val.replace(/\".*/g, "");
            }
            else if (val.match(/^\d+$/g)) {
                val = parseInt(val);
            }
            else {
                quoted = false;
            }
        }
        var key = lineArr[0];
        var currentNotes = getCurrentFeature().notes;
        if (currentNotes[key]) {
            //array already exists, so push value into it
            currentNotes[key].push(val);
        }
        else {
            //array doesn't exist yet, so create it and populate it with the value
            currentNotes[key] = [val];
        }
        currentFeatureNote = currentNotes[key];
    }

    function getLineKey(line) {
        var arr;
        line = line.replace(/^[\s]*/, "");

        if (line.indexOf("=") < 0) {
            arr = line.split(/[\s]+/);
        }
        else {
            arr = line.split(/=/);
        }

        return arr[0];
    }

    function getLineVal(line) {
        var arr;

        if (line.indexOf("=") < 0) {
            line = line.replace(/^[\s]*[\S]+[\s]+|[\s]+$/, "");
            line = line.trim();
            return line;
        }
        else {
            arr = line.split(/=/);
            return arr[1];
        }
    }

    function isKeyword(line) {
        var isKey = false;
        if (line.substr(0, 10).match(/^[\S]+/)) {
            isKey = true;
        }
        return isKey;
    }

    function isSubKeyword(line) {
        var isSubKey = false;
        if (line.substr(0, 10).match(/^[\s]+[\S]+/)) {
            isSubKey = true;
        }
        return isSubKey;
    }

    function isKeywordRunon(line) {
        var runon;
        if (line.substr(0, 10).match(/[\s]{10}/)) {
            runon = true;
        }
        else {
            runon = false;
        }
        return runon;
    }

    function postProcessGenbankFeature(feat) {
        if (feat.notes.label) {
            feat.name = feat.notes.label[0];
        }
        else if (feat.notes.gene) {
            feat.name = feat.notes.gene[0];
        }
        else if (feat.notes.ApEinfo_label) {
            feat.name = feat.notes.ApEinfo_label[0];
        }
        else if (feat.notes.name) {
            feat.name = feat.notes.name[0];
        }
        else if (feat.notes.organism) {
            feat.name = feat.notes.organism[0];
        }
        else if (feat.notes.locus_tag) {
            feat.name = feat.notes.locus_tag[0];
        }
        else if (feat.notes.note) {
            feat.name = feat.notes.note[0];
        }
        else {
            feat.name = '';
        }
        return feat;
    }
}

function isFeatureLineRunon(line, featureLocationIndentation) {
    var indentationOfLine = getLengthOfWhiteSpaceBeforeStartOfLetters(line);
    if (featureLocationIndentation === indentationOfLine) {
        //the feature location indentation calculated right after the feature tag 
        //cannot be the same as the indentation of the line
        //
        //FEATURES             Location/Qualifiers
        //     rep_origin      complement(1074..3302)
        //01234  <-- this is the indentation we're talking about     
        return false; //the line is NOT a run on
    }

    var trimmed = line.trim();
    if (trimmed.charAt(0).match(/\//)) {
        //the first char in the trimmed line cannot be a /
        return false; //the line is NOT a run on
    }
    //the line is a run on
    return true;
    //run-on line example:
    //FEATURES             Location/Qualifiers
    //     rep_origin      complement(1074..3302)
    //                 /label=pSC101**
    //                 /note="REP_ORIGIN REP_ORIGIN pSC101* aka pMPP6, gives plasm
    //                 id number 3 -4 copies per cell, BglII site in pSC101* ori h <--run-on line!
    //                 as been dele ted by quick change agatcT changed to agatcA g <--run-on line!
    //                 iving pSC101* * pSC101* aka pMPP6, gives plasmid number 3-4 <--run-on line!
    //                 copies p er cell, BglII site in pSC101* ori has been delet  <--run-on line!
    //                 ed by quic k change agatcT changed to agatcA giving pSC101* <--run-on line!
    //                 * [pBbS0a-RFP]"                                             <--run-on line!
    //                 /gene="SC101** Ori"
    //                 /note="pSC101* aka pMPP6, gives plasmid number 3-4 copies p
    //                 er cell, BglII site in pSC101* ori has been deleted by qui
    //                 c k change agatcT changed to agatcA giving pSC101**"
    //                 /vntifkey="33"
}

function getLengthOfWhiteSpaceBeforeStartOfLetters(string) {
    var match = /^\s*/.exec(string);
    if (typeof match !== null) {
        return (match[0].length);
    }
    else {
        return 0;
    }
}

module.exports = parseGenbankFileToOurOldTeselagenDataType;