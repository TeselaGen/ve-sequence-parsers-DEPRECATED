import _regeneratorRuntime from "babel-runtime/regenerator";

var anyToJson = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(fileContentStringOrFileObj, onFileParsed, options) {
    var fileContentString, fileName, ext, _onFileParsedWrapped, parsersToTry, firstChar, parser, successfulParsing;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            successfulParsing = function successfulParsing(resultArray) {
              return resultArray.some(function (result) {
                return result.success;
              });
            };

            fileContentString = void 0;

            options = options || {};
            fileName = options.fileName || "";

            if (!fileName && typeof fileContentStringOrFileObj !== "string") {
              fileName = fileContentStringOrFileObj.name;
            }
            ext = extractFileExtension(fileName);

            if (!(typeof fileContentStringOrFileObj === "string")) {
              _context.next = 10;
              break;
            }

            fileContentString = fileContentStringOrFileObj;
            _context.next = 21;
            break;

          case 10:
            if (!/^(ab1)$/.test(ext)) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", ab1ToJson(fileContentStringOrFileObj, onFileParsed, options));

          case 14:
            if (!/^(dna)$/.test(ext)) {
              _context.next = 18;
              break;
            }

            return _context.abrupt("return", snapgeneToJson(fileContentStringOrFileObj, onFileParsed, options));

          case 18:
            _context.next = 20;
            return getFileString(fileContentStringOrFileObj);

          case 20:
            fileContentString = _context.sent;

          case 21:

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
              /* eslint-disable no-inner-declarations*/

              _onFileParsedWrapped = function _onFileParsedWrapped(resultArray) {
                if (successfulParsing(resultArray)) {
                  //continue on to through the normal flow
                  resultArray.forEach(function (result) {
                    result.messages.push("Parsed using " + parser.name + ".");
                  });
                  onFileParsed(resultArray);
                } else {
                  //unsuccessful parsing, so try the next parser in the array
                  if (parsersToTry.length) {
                    parser = parsersToTry.pop();
                    parser.fn(fileContentString, _onFileParsedWrapped, options); //pop the next parser off the array and try to parse with it, using the modified onFileParsed callback
                  } else {
                    //none of the parsers worked
                    onFileParsed([{
                      messages: ["Unable to parse .seq file as FASTA, genbank, JBEI, or SBOL formats"],
                      success: false
                    }]);
                  }
                }
              };
              /* eslint-enable no-inner-declarations*/


              // console.warn(
              //   "TNR: No filename passed to anyToJson so we're going through the list of parsers. Make sure you're passing the filename when using anyToJson!"
              // );
              //runs from BOTTOM to TOP
              parsersToTry = [{
                fn: fastaToJson,
                name: "Fasta Parser"
              }, {
                fn: genbankToJson,
                name: "Genbank Parser"
              }, {
                fn: xmlParser,
                name: "XML Parser"
              }, {
                fn: gffToJson,
                name: "GFF Parser"
              }];
              firstChar = fileContentString[fileContentString.search(/\S|$/)];
              /* eslint-disable array-callback-return*/

              //try to guess the file type based on the first non-whitespace char in the filestring

              if (firstChar === ">") {
                parsersToTry = parsersToTry.sort(function (a, b) {
                  if (a.name === "Fasta Parser") return 1;
                });
              } else if (firstChar === "L") {
                parsersToTry = parsersToTry.sort(function (a, b) {
                  if (a.name === "Genbank Parser") return 1;
                });
              } else if (firstChar === "#") {
                parsersToTry = parsersToTry.sort(function (a, b) {
                  if (a.name === "GFF Parser") return 1;
                });
              } else if (firstChar === "<") {
                parsersToTry = parsersToTry.sort(function (a, b) {
                  if (a.name === "XML Parser") return 1;
                });
              }
              /* eslint-enable array-callback-return*/

              //pop the LAST parser off the array and try to parse with it, using the modified onFileParsed callback
              //evaluates to something like:
              //xmlParser(fileContentString, onFileParsedWrapped)
              parser = parsersToTry.pop();

              parser.fn(fileContentString, _onFileParsedWrapped, options);
            }

            //helper function to determine whether or not the parsing was successful or not

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function anyToJson(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
 * @param  {Function} onFileParsed    //tnr: fill this out
 */
import addPromiseOption from "./utils/addPromiseOption";

export default addPromiseOption(anyToJson);

function getFileString(file) {
  if (typeof window === "undefined") {
    //we're in a node context
    return file;
  }
  var reader = new window.FileReader();
  reader.readAsText(file, "UTF-8");
  return new Promise(function (resolve, reject) {
    reader.onload = function (evt) {
      resolve(evt.target.result);
    };
    reader.onerror = function (err) {
      console.error("err:", err);
      reject(err);
    };
  });
}