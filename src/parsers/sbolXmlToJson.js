/* eslint-disable no-var*/
import flatmap from "flatmap";
import access from "safe-access";
import validateSequenceArray from "./utils/validateSequenceArray";
import searchWholeObjByName from "./utils/searchWholeObjByName";

import { XMLParser } from "fast-xml-parser";

//Here's what should be in the callback:
// {
//   parsedSequence:
//   messages:
//   success:
// }
async function sbolXmlToJson(string, options) {
  options = options || {};
  const onFileParsed = function (sequences) {
    //before we call the onFileParsed callback, we need to validate the sequence
    return validateSequenceArray(sequences, options);
  };
  let response = {
    parsedSequence: null,
    messages: [],
    success: true,
  };
  try {
    const result = new XMLParser({
      isArray: () => true
    }).parse(string);
    const sbolJsonMatches = searchWholeObjByName("DnaComponent", result);
    if (sbolJsonMatches[0]) {
      const resultArray = [];
      for (let i = 0; i < sbolJsonMatches[0].value.length; i++) {
        try {
          response = {
            parsedSequence: null,
            messages: [],
            success: true,
          };
          response.parsedSequence = parseSbolJson(
            sbolJsonMatches[0].value[i],
            options
          );
        } catch (e) {
          console.error("error:", e);
          console.error("error.stack: ", e.stack);
          resultArray.push({
            success: false,
            messages: "Error while parsing Sbol format",
          });
        }
        if (response.parsedSequence.features.length > 0) {
          response.messages.push(
            "SBOL feature types are stored in feature notes"
          );
        }
        resultArray.push(response);
      }
      return onFileParsed(resultArray);
    } else {
      return onFileParsed({
        success: false,
        messages: "XML is not valid Jbei or Sbol format",
      });
    }
  } catch (e) {
    return onFileParsed({
      success: false,
      messages: "Error parsing XML to JSON",
    });
  }
}
// Converts SBOL formats.
//  * Specifications for SBOL can be found at http://www.sbolstandard.org/specification/core-data-model
//  *
//  * The hierarcy of the components in an SBOL object is:
//  *
//  *          The hierarchy is Collection -> DnaComponent -> DnaSequence
//  *
//  * Check for each level and parse downward from there.
// tnrtodo: this should be tested with a wider variety of sbol file types!
function parseSbolJson(sbolJson, options) {
  let name;
  if (access(sbolJson, "name[0]")) {
    name = access(sbolJson, "name[0]");
  } else {
    name = access(sbolJson, "displayId[0]");
  }
  return {
    // circular: access(sbolJson, "seq:circular[0]"), //tnrtodo this needs to be changed
    circular: false,
    sequence: access(sbolJson, "dnaSequence[0].DnaSequence[0].nucleotides"),
    name: name,
    features: flatmap(sbolJson.annotation, function (annotation) {
      const feature = access(annotation, "SequenceAnnotation[0]");
      if (feature) {
        const notes = searchWholeObjByName("ns2:about", feature);
        const otherNotes = searchWholeObjByName("ns2:resource", feature);
        notes.push.apply(notes, otherNotes);
        const newNotes = {};
        notes.forEach(function (note) {
          if (newNotes[note.prop]) {
            newNotes[note.prop].push(note.value);
          } else {
            newNotes[note.prop] = [note.value];
          }
        });
        let featureName;
        const nameMatches = searchWholeObjByName("name", feature);
        if (nameMatches[0] && nameMatches[0].value && nameMatches[0].value[0]) {
          featureName = nameMatches[0].value[0];
        } else {
          const displayMatches = searchWholeObjByName("displayId", feature);
          if (
            displayMatches[0] &&
            displayMatches[0].value &&
            displayMatches[0].value[0]
          ) {
            featureName = displayMatches[0].value[0];
          }
        }
        return {
          name: featureName,
          notes: newNotes,
          type: "misc_feature", // sbol represents the feature type in what we are parsing as notes as the URL is difficult to follow
          // type: feature['seq:label'], //tnrtodo: figure out if an annotation type is passed
          // id: feature['seq:label'],
          start: parseInt(
            access(feature, "bioStart[0]") -
              (options.inclusive1BasedStart ? 0 : 1)
          ),
          end: parseInt(
            access(feature, "bioEnd[0]") - (options.inclusive1BasedEnd ? 0 : 1)
          ),
          strand: access(feature, "strand[0]"), //+ or -
          // notes: feature['seq:label'],
        };
      }
    }),
  };
}

export default sbolXmlToJson;
