//tnrtodo make the edit feature window use the new FeatureTypes.js stuff instead of the constants.FeatureTypes...
var FastaToJSON = require('./FastaToJSON');
var GenbankToJSON = require('./GenbankToJSON');
var jsonParser = require('./JbeiseqToJSON');
var xmlParser = require('./SbolOrJbeiSeqXMLToJSON');
var extractFileExtension = require('./utils/extractFileExtension.js');
var parseString = require('xml2js').parseString;
var ac = require('ve-api-check');

/**
 * takes in file content string and its file name and determines what parser it needs to be sent to.
 * The file is parsed to our old JSON schema and after it goes through an intermediate step where we convert that json to our new schema
 * @param  {string} fileContentString content of the file as a string
 * @param  {string} fileName          file name including extension
 * @param  {callback} onFileParsed    //tnr: fill this out
 */
module.exports = function anyToJSON(fileContentString, fileName, isProtein, onFileParsed) {
    ac.warn([ac.string, ac.string, ac.bool, ac.func], arguments);
    var parsedOutput = {};
    var ext = extractFileExtension(fileName);
    if (/^(fasta|fas|fa|fna|ffn)$/.test(ext)) { // FASTA
        FastaToJSON(fileContentString, onFileParsed, isProtein);
    }
    else if (/^(gb|gp|gbk)$/.test(ext)) { // GENBANK
        GenbankToJSON(fileContentString, onFileParsed, isProtein);
    }
    else if (/^(gp)$/.test(ext)) { // PROTEIN GENBANK
        GenbankToJSON(fileContentString, onFileParsed, isProtein, true);
    }
    else if (/^(json)$/.test(ext)) { // JSON
        jsonParser(fileContentString, onFileParsed, isProtein);
    }
    else if (/^(xml|rdf)$/.test(ext)) { // XML/RDF
        xmlParser(fileContentString, onFileParsed, isProtein);
    }
    else {
        //runs from BOTTOM to TOP
        var parsersToTry = [{
            fn: FastaToJSON,
            name: "Fasta Parser"
        }, {
            fn: GenbankToJSON,
            name: "Genbank Parser"
        }, {
            fn: xmlParser,
            name: "XML Parser"
        }];
        //pop the LAST parser off the array and try to parse with it, using the modified onFileParsed callback
        //evaluates to something like: 
        //xmlParser(fileContentString, onFileParsedWrapped)
        var parser = parsersToTry.pop();
        parser.fn(fileContentString, onFileParsedWrapped, isProtein);
    }

    function onFileParsedWrapped(resultArray) {
        if (successfulParsing(resultArray)) {
            //continue on to through the normal flow
            resultArray.forEach(function(result) {
                result.messages.push('Parsed using ' + parser.name + '.');
            });
            onFileParsed(resultArray);
        }
        else {
            //unsuccessful parsing, so try the next parser in the array
            if (parsersToTry.length) {
                parser = parsersToTry.pop();
                parser.fn(fileContentString, onFileParsedWrapped, isProtein); //pop the next parser off the array and try to parse with it, using the modified onFileParsed callback
            }
            else {
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
        return resultArray.some(function(result) {
            return result.success;
        });
    }

};