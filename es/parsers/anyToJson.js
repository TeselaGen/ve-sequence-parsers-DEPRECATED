var fastaToJson = require('./fastaToJson');
var genbankToJson = require('./genbankToJson');
var xmlParser = require('./sbolXmlToJson');
var extractFileExtension = require('./utils/extractFileExtension.js');

/**
 * takes in file content string and its file name and determines what parser it needs to be sent to.
 * The file is parsed to our old JSON schema and after it goes through an intermediate step where we convert that json to our new schema
 * @param  {string} fileContentString content of the file as a string
 * @param  {callback} onFileParsed    //tnr: fill this out
 */
module.exports = function anyToJson(fileContentString, onFileParsed, options) {
    options = options || {};
    // var isProtein = options.isProtein || false;
    var fileName = options.fileName || '';
    var ext = extractFileExtension(fileName);
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
    } else {
        //runs from BOTTOM to TOP
        var parsersToTry = [{
            fn: fastaToJson,
            name: "Fasta Parser"
        }, {
            fn: genbankToJson,
            name: "Genbank Parser"
        }, {
            fn: xmlParser,
            name: "XML Parser"
        }];
        //pop the LAST parser off the array and try to parse with it, using the modified onFileParsed callback
        //evaluates to something like:
        //xmlParser(fileContentString, onFileParsedWrapped)
        var parser = parsersToTry.pop();
        parser.fn(fileContentString, onFileParsedWrapped, options);
    }

    function onFileParsedWrapped(resultArray) {
        if (successfulParsing(resultArray)) {
            //continue on to through the normal flow
            resultArray.forEach(function (result) {
                result.messages.push('Parsed using ' + parser.name + '.');
            });
            onFileParsed(resultArray);
        } else {
            //unsuccessful parsing, so try the next parser in the array
            if (parsersToTry.length) {
                parser = parsersToTry.pop();
                parser.fn(fileContentString, onFileParsedWrapped, options); //pop the next parser off the array and try to parse with it, using the modified onFileParsed callback
            } else {
                //none of the parsers worked
                onFileParsed([{
                    messages: ['Unable to parse .seq file as FASTA, genbank, JBEI, or SBOL formats'],
                    success: false
                }]);
            }
        }
    }

    //helper function to determine whether or not the parsing was successful or not
    function successfulParsing(resultArray) {
        return resultArray.some(function (result) {
            return result.success;
        });
    }
};