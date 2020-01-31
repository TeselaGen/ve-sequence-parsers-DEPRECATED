/* eslint-disable no-var*/
import { convertAACaretPositionOrRangeToDna } from "ve-sequence-utils";

import constants, { gbDivisions } from "./utils/constants";
import flattenSequenceArray from "./utils/flattenSequenceArray";
import validateSequenceArray from "./utils/validateSequenceArray";

// var some = require('lodash/collection/some');
import splitStringIntoLines from "./utils/splitStringIntoLines.js";

import createInitialSequence from "./utils/createInitialSequence";
import addPromiseOption from "./utils/addPromiseOption";

function genbankToJson(string, onFileParsedUnwrapped, options) {
  var onFileParsed = function onFileParsed(sequences, options) {
    //before we call the onFileParsed callback, we need to flatten the sequence, and convert the old sequence data to the new data type
    var sequenceData = validateSequenceArray(flattenSequenceArray(sequences, options), options);
    // default sequence json has primers at the top level separate from features, e.g. parsedSequence: { primers: [ {}, {} ], features: [ {}, {} ] }
    // if options.primersAsFeatures is set to true, primers are included in features with type set to primer
    if (!options.primersAsFeatures) {
      for (var i = 0; i < sequenceData.length; i++) {
        sequenceData[i].parsedSequence.primers = sequenceData[i].parsedSequence.features.filter(function (feat) {
          return feat.type === "primer";
        });
        sequenceData[i].parsedSequence.features = sequenceData[i].parsedSequence.features.filter(function (feat) {
          return feat.type !== "primer";
        });
      }
    }
    onFileParsedUnwrapped(sequenceData);
  };
  options = options || {};
  var inclusive1BasedStart = options.inclusive1BasedStart;
  var inclusive1BasedEnd = options.inclusive1BasedEnd;

  var resultsArray = [];
  var result = void 0;
  var currentFeatureNote = void 0;

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

  var featureLocationIndentation = void 0;
  try {
    var lines = splitStringIntoLines(string);
    var LINETYPE = false;

    if (lines === null) {
      addMessage("Import Error: Sequence file is empty");
    }
    var hasFoundLocus = false;

    lines.some(function (line) {
      if (line === null) {
        return true; //break the some loop
      }
      var key = getLineKey(line);
      var val = getLineVal(line);
      var isKeyRunon = isKeywordRunon(line);
      var isSubKey = isSubKeyword(line);
      var isKey = isKeyword(line);

      //only set a new LINETYPE in the case that we've encountered a key that warrants it.
      if (key === "LOCUS") {
        LINETYPE = key;
      } else if (key === "REFERENCE") {
        LINETYPE = key;
      } else if (key === "FEATURES") {
        LINETYPE = key;
      } else if (key === "ORIGIN") {
        LINETYPE = key;
      } else if (key === "//") {
        LINETYPE = key;
      } else if (isKey === true) {
        LINETYPE = key;
      }

      // IGNORE LINES: DO NOT EVEN PROCESS
      if (line.trim() === "" || key === ";") {
        //tnr: don't add the following message because it is not particularly informative
        // addMessage(
        //     "Warning: Empty line, or ';' detected. Ignoring line: " +
        //     line);
        return false; // go to next line
      }

      if (!hasFoundLocus && LINETYPE !== genbankAnnotationKey.LOCUS_TAG) {
        // 'Genbank files must start with a LOCUS tag so this must not be a genbank'
        return true; //break the some loop
      }

      switch (LINETYPE) {
        case genbankAnnotationKey.LOCUS_TAG:
          hasFoundLocus = true;
          parseLocus(line, key, val);
          break;
        case genbankAnnotationKey.FEATURES_TAG:
          //If no location is specified, exclude feature and return messages
          if (val === "") {
            addMessage("Warning: The feature '" + key + "'' has no location specified. This line has been ignored: line" + line);
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
        case genbankAnnotationKey.DEFINITION_TAG:
          line = line.replace(/DEFINITION/, "");
          line = line.trim();
          if (result.parsedSequence) {
            result.parsedSequence.definition = line;
            result.parsedSequence.description = line;
          } else {
            throw new Error("no sequence yet created upon which to extract an extra line!");
          }
          break;
        case "COMMENT":
          line = line.replace(/COMMENT/, "");
          line = line.trim();
          if (result.parsedSequence) {
            if (!result.parsedSequence.comments) {
              result.parsedSequence.comments = [];
            }
            if (line.indexOf("teselagen_unique_id:") > -1) {
              //capture the special comment
              result.parsedSequence.teselagen_unique_id = line.replace(/ /g, "").replace("teselagen_unique_id:", "");
            } else if (line.indexOf("library:") > -1) {
              result.parsedSequence.library = line.replace(/ /g, "").replace("library:", "");
            } else {
              result.parsedSequence.comments.push(line);
            }
          } else {
            throw new Error("no sequence yet created upon which to extract an extra line!");
          }
          break;
        default:
          // FOLLOWING FOR KEYWORDS NOT PREVIOUSLY DEFINED IN CASES
          extractExtraLine(line);
          if (key === "BASE") {
            // do nothing;              // BLANK LINES || line with ;;;;;;;;;  || "BASE COUNT"
            // console.warn("Parsing GenBank File: This line with BaseCount has been ignored: " + line);
            addMessage("Warning: This BaseCount line has been ignored: " + line);
            break;
          } else if (isKey) {
            // REGULAR KEYWORDS (NOT LOCUS/FEATURES/ORIGIN) eg VERSION, ACCESSION, SOURCE, REFERENCE
            // lastObj = parseKeyword(line, gb);
          } else if (isSubKey) {
            // REGULAR SUBKEYWORD, NOT FEATURE eg AUTHOR, ORGANISM
            // tmp = gb.getLastKeyword();
            // lastObj = parseSubKeyword(tmp, line, gb);
          } else if (isKeyRunon) {
            // RUNON LINES FOR NON-FEATURES
            // lastObj.setValue(lastObj.getValue() + Teselagen.StringUtil.rpad("\n"," ",13) + Ext.String.trim(line));
            // lastObj.appendValue(Teselagen.StringUtil.rpad("\n"," ",13) + Ext.String.trim(line), gb);
          } else {
            // console.warn("Parsing GenBank File: This line has been ignored: " + line);
            addMessage("Warning: This line has been ignored: " + line);
          }
      }
      return false;
    });
  } catch (e) {
    //catch any errors and set the result
    console.error("Error trying to parse file as .gb:", e);
    result = {
      success: false,
      messages: ["Import Error: Invalid File"]
    };
  }

  //catch the case where we've successfully started a sequence and parsed it, but endSeq isn't called correctly
  if (result.success && resultsArray[resultsArray.length - 1] !== result) {
    //current result isn't in resultsArray yet
    //so we call endSeq here
    endSeq();
  }
  //call the callback
  onFileParsed(resultsArray, options);

  function endSeq() {
    //do some post processing clean-up
    postProcessCurSeq();
    //push the result into the resultsArray
    resultsArray.push(result);
  }

  function getCurrentFeature() {
    return result.parsedSequence.features[result.parsedSequence.features.length - 1];
  }

  function addMessage(msg) {
    if (result.messages.indexOf(msg === -1)) {
      return result.messages.push(msg);
    }
  }

  function postProcessCurSeq() {
    if (result.parsedSequence && result.parsedSequence.features) {
      for (var i = 0; i < result.parsedSequence.features.length; i++) {
        result.parsedSequence.features[i] = postProcessGenbankFeature(result.parsedSequence.features[i]);
      }
    }
  }

  function parseOrigin(line, key) {
    if (key !== genbankAnnotationKey.ORIGIN_TAG) {
      var new_line = line.replace(/[\s]*[0-9]*/g, "");
      result.parsedSequence.sequence += new_line;
    }
  }

  function parseLocus(line) {
    result = createInitialSequence(options);
    var locusName = void 0;
    var linear = void 0;
    var gbDivision = void 0;
    var date = void 0;
    var lineArr = line.split(/[\s]+/g);

    if (lineArr.length <= 1) {
      console.warn("Parsing GenBank File: WARNING! Locus line contains no values!");
      // TODO
      addMessage("Import Warning: Locus line contains no values: " + line);
    }
    locusName = lineArr[1];

    // Linear vs Circular?
    linear = true;
    for (var i = 1; i < lineArr.length; i++) {
      if (lineArr[i].match(/circular/gi)) {
        linear = false;
      }
    }

    // Date and Div
    // Date is in format:1-APR-2012
    for (var j = 1; j < lineArr.length; j++) {
      if (lineArr[j].match(/-[A-Z]{3}-/g)) {
        date = lineArr[j];
      }
      if (j === 3 && lineArr[j].match(/aa/i)) {
        options.isProtein = true;
      }
    }

    // Division
    for (var _i = 1; _i < lineArr.length; _i++) {
      if (typeof lineArr[_i] === "string" && gbDivisions[lineArr[_i].toUpperCase()]) {
        gbDivision = lineArr[_i].toUpperCase();
      }
    }

    //don't use "exported as a file name unless it is out last option"
    if (locusName !== "Exported" || result.parsedSequence.name === constants.untitledSequenceName) {
      result.parsedSequence.name = locusName;
    }
    result.parsedSequence.gbDivision = gbDivision;
    result.parsedSequence.date = date;
    result.parsedSequence.circular = !linear;
  }

  function extractExtraLine(line) {
    if (result.parsedSequence) {
      if (!result.parsedSequence.extraLines) {
        result.parsedSequence.extraLines = [];
      }
      result.parsedSequence.extraLines.push(line);
    } else {
      throw new Error("no sequence yet created upon which to extract an extra line!");
    }
  }
  /* eslint-disable no-var */
  var lastLineWasFeaturesTag;
  var lastLineWasLocation;
  /* eslint-enable no-var*/

  function parseFeatures(line, key, val) {
    var strand = void 0;
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
        parseFeatureLocation(line.trim(), options);
        lastLineWasLocation = true;
      } else {
        //the last line was a note
        if (currentFeatureNote) {
          //append to the currentFeatureNote
          currentFeatureNote[currentFeatureNote.length - 1] += line.trim().replace(/"/g, "");
        }
        lastLineWasLocation = false;
      }
    } else {
      // New Element/Qualifier lines. Not runon lines.
      if (isNote(line)) {
        // is a new Feature Element (e.g. source, CDS) in the form of  "[\s] KEY  SEQLOCATION"
        // is a FeatureQualifier in the /KEY="BLAH" format; could be multiple per Element
        //Check that feature did not get skipped for missing location
        if (getCurrentFeature()) {
          parseFeatureNote(line);
          lastLineWasLocation = false;
        } else {
          return;
        }
      } else {
        //the line is a location, so we make a new feature from it
        if (val.match(/complement/g)) {
          strand = -1;
        } else {
          strand = 1;
        }

        newFeature();
        var feat = getCurrentFeature();
        feat.type = key;
        feat.strand = strand;

        parseFeatureLocation(val, options);
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
    if (line.trim().charAt(0).match(/\//)) {
      // searches based on looking for / in beginning of line
      qual = true;
    } else if (line.match(/^[\s]*\/[\w]+=[\S]+/)) {
      // searches based on "   /key=BLAH" regex
      qual = true;
    }
    return qual;
  }

  function parseFeatureLocation(locStr, options) {
    locStr = locStr.trim();
    var locArr = [];
    locStr.replace(/(\d+)/g, function (string, match) {
      locArr.push(match);
    });
    for (var i = 0; i < locArr.length; i += 2) {
      var start = parseInt(locArr[i], 10) - (inclusive1BasedStart ? 0 : 1);
      var end = parseInt(locArr[i + 1], 10) - (inclusive1BasedEnd ? 0 : 1);
      if (isNaN(end)) {
        //if no end is supplied, assume that the end should be set to whatever the start is
        //this makes a feature location passed as:
        //147
        //function like:
        //147..147
        end = start;
      }
      var location = {
        start: start,
        end: end
      };
      var feat = getCurrentFeature();
      feat.locations.push(options.isProtein ? convertAACaretPositionOrRangeToDna(location) : location);
    }
  }

  function parseFeatureNote(line) {
    var newLine = void 0,
        lineArr = void 0;

    newLine = line.trim();
    newLine = newLine.replace(/^\/|"$/g, "");
    lineArr = newLine.split(/="|=/);

    var val = lineArr.slice(1).join('=');

    if (val) {
      val = val.replace(/\\/g, " ");

      if (line.match(/="/g)) {
        val = val.replace(/".*/g, "");
      } else if (val.match(/^\d+$/g)) {
        val = parseInt(val, 10);
      }
    }
    var key = lineArr[0];
    var currentNotes = getCurrentFeature().notes;
    if (currentNotes[key]) {
      //array already exists, so push value into it
      currentNotes[key].push(val);
    } else {
      //array doesn't exist yet, so create it and populate it with the value
      currentNotes[key] = [val];
    }
    currentFeatureNote = currentNotes[key];
  }

  function getLineKey(line) {
    var arr = void 0;
    line = line.replace(/^[\s]*/, "");

    if (line.indexOf("=") < 0) {
      arr = line.split(/[\s]+/);
    } else {
      arr = line.split(/=/);
    }

    return arr[0];
  }

  function getLineVal(line) {
    var arr = void 0;
    if (line.indexOf("=") < 0) {
      line = line.replace(/^[\s]*[\S]+[\s]+|[\s]+$/, "");
      line = line.trim();
      return line;
    } else {
      arr = line.split(/=/);
      return arr.slice(1).join('');
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
    var runon = void 0;
    if (line.substr(0, 10).match(/[\s]{10}/)) {
      runon = true;
    } else {
      runon = false;
    }
    return runon;
  }

  function postProcessGenbankFeature(feat) {
    if (feat.notes.label) {
      feat.name = feat.notes.label[0];
    } else if (feat.notes.gene) {
      feat.name = feat.notes.gene[0];
    } else if (feat.notes.ApEinfo_label) {
      feat.name = feat.notes.ApEinfo_label[0];
    } else if (feat.notes.name) {
      feat.name = feat.notes.name[0];
    } else if (feat.notes.organism) {
      feat.name = feat.notes.organism[0];
    } else if (feat.notes.locus_tag) {
      feat.name = feat.notes.locus_tag[0];
    } else if (feat.notes.note) {
      //if the name is coming from a note, shorten the name to 100 chars long
      feat.name = feat.notes.note[0].substr(0, 100);
    } else {
      feat.name = "Untitled Feature";
    }
    feat.name = typeof feat.name === "string" ? feat.name : String(feat.name);
    if (feat.name !== 0 && !feat.name) {
      feat.name = "Untitled Feature";
    }
    if (feat.name.length > 100) {
      //shorten the name to a reasonable length if necessary and warn the user about it
      var oldName = feat.name;
      feat.name = feat.name.substr(0, 100);
      addMessage("Warning: Shortening name of feature " + oldName + " (max 100 chars)");
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
  if (match !== null) {
    return match[0].length;
  } else {
    return 0;
  }
}

export default addPromiseOption(genbankToJson);