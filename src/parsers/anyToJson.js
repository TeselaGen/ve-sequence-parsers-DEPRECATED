import fastaToJson from "./fastaToJson";
import genbankToJson from "./genbankToJson";
import xmlParser from "./sbolXmlToJson";
import extractFileExtension from "./utils/extractFileExtension.js";
import snapgeneToJson from "./snapgeneToJson";
import ab1ToJson from "./ab1ToJson";
import gffToJson from "./gffToJson";

/**
 * takes in file content string and its file name and determines what parser it needs to be sent to.
 * The file is parsed to our old JSON schema and after it goes through an intermediate step where we convert that json to our new schema
 * @param  {string} fileContentString content of the file as a string
 * @param  {callback} onFileParsed    //tnr: fill this out
 */
import addPromiseOption from "./utils/addPromiseOption";

async function anyToJson(fileContentStringOrFileObj, onFileParsed, options) {
  let fileContentString;
  options = options || {};
  let fileName = options.fileName || "";
  if (!fileName && typeof fileContentStringOrFileObj !== "string") {
    fileName = fileContentStringOrFileObj.name;
  }
  const ext = extractFileExtension(fileName);
  if (typeof fileContentStringOrFileObj === "string") {
    fileContentString = fileContentStringOrFileObj;
  } else {
    if (/^(ab1)$/.test(ext)) {
      // AB1 sequencing read
      //we will always want to pass the file obj and not the string to ab1
      return ab1ToJson(fileContentStringOrFileObj, onFileParsed, options);
    } else if (/^(dna)$/.test(ext)) {
      // snapgene file
      //we will always want to pass the file obj and not the string to the snapgene parser because it expects a binary file
      return snapgeneToJson(fileContentStringOrFileObj, onFileParsed, options);
    } else {
      // we want to get the string from the file obj
      fileContentString = await getFileString(fileContentStringOrFileObj);
    }
  }

  if (/^(fasta|fas|fa|fna|ffn)$/.test(ext)) {
    // FASTA
    fastaToJson(fileContentString, onFileParsed, options);
  } else if (/^(gb|gp|gbk)$/.test(ext)) {
    // GENBANK
    genbankToJson(fileContentString, onFileParsed, options);
  } else if (/^(gp)$/.test(ext)) {
    // PROTEIN GENBANK
    genbankToJson(fileContentString, onFileParsed, options, true);
  } else if (/^(xml|rdf)$/.test(ext)) {
    // XML/RDF
    xmlParser(fileContentString, onFileParsed, options);
  } else if (/^(gff|gff3)$/.test(ext)) {
    // GFF
    gffToJson(fileContentString, onFileParsed, options);
  } else {
    // console.warn(
    //   "TNR: No filename passed to anyToJson so we're going through the list of parsers. Make sure you're passing the filename when using anyToJson!"
    // );
    //runs from BOTTOM to TOP
    let parsersToTry = [
      {
        fn: fastaToJson,
        name: "Fasta Parser"
      },
      {
        fn: genbankToJson,
        name: "Genbank Parser"
      },
      {
        fn: xmlParser,
        name: "XML Parser"
      },
      {
        fn: gffToJson,
        name: "GFF Parser"
      }
    ];
    const firstChar = fileContentString[fileContentString.search(/\S|$/)];
    /* eslint-disable array-callback-return*/

    //try to guess the file type based on the first non-whitespace char in the filestring
    if (firstChar === ">") {
      parsersToTry = parsersToTry.sort((a, b) => {
        if (a.name === "Fasta Parser") return 1;
      });
    } else if (firstChar === "L") {
      parsersToTry = parsersToTry.sort((a, b) => {
        if (a.name === "Genbank Parser") return 1;
      });
    } else if (firstChar === "#") {
      parsersToTry = parsersToTry.sort((a, b) => {
        if (a.name === "GFF Parser") return 1;
      });
    } else if (firstChar === "<") {
      parsersToTry = parsersToTry.sort((a, b) => {
        if (a.name === "XML Parser") return 1;
      });
    }
    /* eslint-enable array-callback-return*/

    //pop the LAST parser off the array and try to parse with it, using the modified onFileParsed callback
    //evaluates to something like:
    //xmlParser(fileContentString, onFileParsedWrapped)
    let parser = parsersToTry.pop();
    parser.fn(fileContentString, onFileParsedWrapped, options);
    /* eslint-disable no-inner-declarations*/

    function onFileParsedWrapped(resultArray) {
      if (successfulParsing(resultArray)) {
        //continue on to through the normal flow
        resultArray.forEach(function(result) {
          result.messages.push("Parsed using " + parser.name + ".");
        });
        onFileParsed(resultArray);
      } else {
        //unsuccessful parsing, so try the next parser in the array
        if (parsersToTry.length) {
          parser = parsersToTry.pop();
          parser.fn(fileContentString, onFileParsedWrapped, options); //pop the next parser off the array and try to parse with it, using the modified onFileParsed callback
        } else {
          //none of the parsers worked
          onFileParsed([
            {
              messages: [
                "Unable to parse .seq file as FASTA, genbank, JBEI, or SBOL formats"
              ],
              success: false
            }
          ]);
        }
      }
    }
    /* eslint-enable no-inner-declarations*/
  }

  //helper function to determine whether or not the parsing was successful or not
  function successfulParsing(resultArray) {
    return resultArray.some(function(result) {
      return result.success;
    });
  }
}

export default addPromiseOption(anyToJson);

function getFileString(file) {
  if (typeof window === "undefined") {
    //we're in a node context
    return file;
  }
  let reader = new window.FileReader();
  reader.readAsText(file, "UTF-8");
  return new Promise((resolve, reject) => {
    reader.onload = evt => {
      resolve(evt.target.result);
    };
    reader.onerror = err => {
      console.error("err:", err);
      reject(err);
    };
  });
}
