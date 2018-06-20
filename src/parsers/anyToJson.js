const fastaToJson = require('./fastaToJson');
const genbankToJson = require('./genbankToJson');
const xmlParser = require('./sbolXmlToJson');
const extractFileExtension = require('./utils/extractFileExtension.js');
const snapgeneToJson = require('./snapgeneToJson');
const ab1ToJson = require('./ab1ToJson');

/**
 * takes in file content string and its file name and determines what parser it needs to be sent to.
 * The file is parsed to our old JSON schema and after it goes through an intermediate step where we convert that json to our new schema
 * @param  {string} fileContentString content of the file as a string
 * @param  {callback} onFileParsed    //tnr: fill this out
 */
const addPromiseOption = require('./utils/addPromiseOption');

async function anyToJson(fileContentStringOrFileObj, onFileParsed, options) {
    let fileContentString
    options = options || {}
    // const isProtein = options.isProtein || false;
    const fileName = options.fileName || '';
    const ext = extractFileExtension(fileName);
    if (typeof fileContentStringOrFileObj === "string") {
        fileContentString = fileContentStringOrFileObj
    } else {
        if (/^(ab1)$/.test(ext)) { // AB1 sequencing read
            //we will always want to pass the file obj and not the string to ab1
            return ab1ToJson(fileContentStringOrFileObj, onFileParsed, options);
        } 
        else if (/^(.dna)$/.test(ext)) { // snapgene file
            //we will always want to pass the file obj and not the string to the snapgene parser because it expects a binary file
            return snapgeneToJson(fileContentStringOrFileObj, onFileParsed, options);
        } else {
            // we want to get the string from the file obj
            fileContentString = await getFileString(fileContentStringOrFileObj)
        }
    }

    if (/^(fasta|fas|fa|fna|ffn)$/.test(ext)) { // FASTA
        fastaToJson(fileContentString, onFileParsed, options);
    }
    else if (/^(gb|gp|gbk)$/.test(ext)) { // GENBANK
        genbankToJson(fileContentString, onFileParsed, options);
    }
    else if (/^(gp)$/.test(ext)) { // PROTEIN GENBANK
        genbankToJson(fileContentString, onFileParsed, options, true);
    }
    else if (/^(xml|rdf)$/.test(ext)) { // XML/RDF
        xmlParser(fileContentString, onFileParsed, options);
    }
    else {
        //runs from BOTTOM to TOP
        const parsersToTry = [{
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
        let parser = parsersToTry.pop();
        parser.fn(fileContentString, onFileParsedWrapped, options);
        /* eslint-disable no-inner-declarations*/ 
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
                    parser.fn(fileContentString, onFileParsedWrapped, options); //pop the next parser off the array and try to parse with it, using the modified onFileParsed callback
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
        /* eslint-enable no-inner-declarations*/ 
    }


    //helper function to determine whether or not the parsing was successful or not
    function successfulParsing(resultArray) {
        return resultArray.some(function(result) {
            return result.success;
        });
    }

};

module.exports = addPromiseOption(anyToJson);


function getFileString(file) {
    if (typeof window === "undefined") {
        //we're in a node context
        return file
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
    })
}