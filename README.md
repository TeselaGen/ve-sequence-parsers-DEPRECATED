# Bio Parsers
<!-- TOC -->

- [Bio Parsers](#bio-parsers)
  - [About this Repo](#about-this-repo)
  - [Exported Functions](#exported-functions)
  - [Format Specification](#format-specification)
  - [Usage](#usage)
    - [install](#install)
    - [jsonToGenbank (same interface as jsonToFasta) (no async required!)](#jsonToGenbank-same-interface-as-jsonToFasta-no-async-required)
    - [anyToJson (same interface as genbankToJson, fastaToJson, xxxxToJson) (async required)](#anyToJson-same-interface-as-genbankToJson-fastaToJson-xxxxToJson-async-required)
    - [Options (for anyToJson or xxxxToJson)](#options-for-anyToJson-or-xxxxToJson)
    - [ab1ToJson](#ab1ToJson)
    - [snapgeneToJson (.dna files)](#snapgeneToJson-dna-files)
    - [genbankToJson](#genbankToJson)
  - [Editing This Repo](#editing-this-repo)
    - [All collaborators:](#all-collaborators)
  - [Debug](#debug)
  - [Updating this repo](#updating-this-repo)
    - [Teselagen collaborators](#teselagen-collaborators)
    - [Outside collaborators](#outside-collaborators)
  - [Thanks/Collaborators](#thankscollaborators)

<!-- /TOC -->
## About this Repo
This repo contains a set of parsers to convert between datatypes through a generalized JSON format.

## Exported Functions
Use the following exports to convert to a generalized JSON format:
```
fastaToJson //handles fasta files (.fa, .fasta)
genbankToJson //handles genbank files (.gb, .gbk)
ab1ToJson //handles .ab1 sequencing read files 
sbolXmlToJson //handles .sbol files
snapgeneToJson //handles snapgene (.dna) files
anyToJson    //this handles any of the above file types based on file extension
```

Use the following exports to convert from a generalized JSON format back to a specific format:
```
jsonToGenbank
jsonToFasta
```


## Format Specification
The generalized JSON format looks like:
```js
const generalizedJsonFormat = {
    "size": 25,
    "sequence": "asaasdgasdgasdgasdgasgdasgdasdgasdgasgdagasdgasdfasdfdfasdfa",
    "circular": true,
    "name": "pBbS8c-RFP",
    "description": "",
    "chromatogramData": { //only if parsing in an ab1 file
      "aTrace": [], //same as cTrace but for a
      "tTrace": [], //same as cTrace but for t
      "gTrace": [], //same as cTrace but for g
      "cTrace": [0,0,0,1,3,5,11,24,56,68,54,30,21,3,1,4,1,0,0, ...etc], //heights of the curve spaced 1 per x position (aka if the cTrace.length === 1000, then the max basePos can be is 1000)
      "basePos": [33, 46, 55, ...etc], //x position of the bases (can be unevenly spaced)
      "baseCalls": ["A", "T", ...etc],
      "qualNums": [],
    },
    "features": [
        {
            "name": "anonymous feature",
            "type": "misc_feature",
            "id": "5590c1978979df000a4f02c7", //Must be a unique id. If no id is provided, we'll autogenerate one for you
            "start": 1,
            "end": 3,
            "strand": 1,
            "notes": {},
        },
        {
            "name": "coding region 1",
            "type": "CDS",
            "id": "5590c1d88979df000a4f02f5",
            "start": 12,
            "end": 9,
            "strand": -1,
            "notes": {},
        }
    ],
}
```


## Usage
### install
`npm install -S bio-parsers` 

or 

`yarn add bio-parsers`

### jsonToGenbank (same interface as jsonToFasta) (no async required!)
```js
//To go from json to genbank:
const jsonToGenbank = require('bio-parsers').jsonToGenbank;
//or alternatively (if using the package on the front end and you want to keep memory usage low)
const jsonToGenbank = require('bio-parsers/parsers/jsonToGenbank');
//You can pass an optional options object as the second argument. Here are the defaults
const options = {
  isProtein: false, //by default the sequence will be parsed and validated as type DNA (unless U's instead of T's are found). If isProtein=true the sequence will be parsed and validated as a PROTEIN type (seqData.isProtein === true)
  guessIfProtein: false, //if true the parser will attempt to guess if the sequence is of type DNA or type PROTEIN (this will override the isProtein flag)
  guessIfProteinOptions: {
    threshold = 0.90, //percent of characters that must be DNA letters to be considered of type DNA
    dnaLetters = ['G', 'A', 'T', 'C'] //customizable set of letters to use as DNA 
  }, 
  inclusive1BasedStart: false //by default feature starts are parsed out as 0-based and inclusive 
  inclusive1BasedEnd: false //by default feature ends are parsed out as 0-based and inclusive 
  // Example:
  // 0123456
  // ATGAGAG
  // --fff--  (the feature covers GAG)
  // 0-based inclusive start:
  // feature.start = 2
  // 1-based inclusive start:
  // feature.start = 3
  // 0-based inclusive end:
  // feature.end = 4
  // 1-based inclusive end:
  // feature.end = 5
} 
const genbankString = jsonToGenbank(generalizedJsonFormat, options)

```
### anyToJson (same interface as genbankToJson, fastaToJson, xxxxToJson) (async required)

```js
const anyToJson = require('bio-parsers').anyToJson;
anyToJson(
  stringOrFile, //if ab1 files are being passed in you should pass files only, otherwise strings or files are fine as inputs
  onFinishedCallback, 
  options //options.fileName (eg "pBad.ab1" or "pCherry.fasta") is important to pass here in order for the parser to!
) 

function onFinishedCallback (results) {
  //we always return an array of results because some files my contain multiple sequences 
  results[0].success //either true or false 
  results[0].messages //either an array of strings giving any warnings or errors generated during the parsing process
  results[0].parsedSequence //this will be the generalized json format as specified above :)
  //chromatogram data will be here (ab1 only): 
  results[0].parsedSequence.chromatogramData 
}

//or use it as a promise! 
const results = await anyToJson(stringOrFile, options)

```

### Options (for anyToJson or xxxxToJson)
```js
//You can pass an optional options object as the third argument. Here are the defaults
const options = {
  fileName: "example.gb", //the filename is used if none is found in the genbank           
  isProtein: false, //if you know that it is a protein string being parsed you can pass true here
  parseFastaAsCircular: false; //by default fasta files are parsed as linear sequences. You can change this by setting parseFastaAsCircular=true 
  //genbankToJson options only
  inclusive1BasedStart: false //by default feature starts are parsed out as 0-based and inclusive 
  inclusive1BasedEnd: false //by default feature ends are parsed out as 0-based and inclusive 
  acceptParts: true //by default features with a feature.notes.pragma[0] === "Teselagen_Part" are added to the sequenceData.parts array. Setting this to false will keep them as features instead
}
```

### ab1ToJson

```js
const ab1ToJson = require('bio-parsers').ab1ToJson;
ab1ToJson(
  //this can be either a browser file  <input type="file" id="input" multiple onchange="ab1ToJson(this.files[0])">
  // or a node file ab1ToJson(fs.readFileSync(path.join(__dirname, './testData/ab1/example1.ab1')));
  file, 
  onFinishedCallback, 
  options //options.fileName (eg "pBad.ab1" or "pCherry.fasta") is important to pass here in order for the parser to!
)

function onFinishedCallback (results) {
  //we always return an array of results because some files my contain multiple sequences 
  results[0].success //either true or false 
  results[0].messages //either an array of strings giving any warnings or errors generated during the parsing process
  results[0].parsedSequence //this will be the generalized json format as specified above :)
  //chromatogram data will be here (ab1 only): 
  results[0].parsedSequence.chromatogramData 
}


//or use it as a promise! 
const results = await ab1ToJson(file, options)
```

### snapgeneToJson (.dna files) 
```js
//All of the xxxxToJson parsers work like this:
const snapgeneToJson = require('bio-parsers').snapgeneToJson;
//or alternatively (if using the package on the front end and you want to keep memory usage low)
const snapgeneToJson = require('bio-parsers/parsers/snapgeneToJson');

//file can be either a browser file  <input type="file" id="input" multiple onchange="snapgeneToJson(this.files[0])">
// or a node file snapgeneToJson(fs.readFileSync(path.join(__dirname, './testData/ab1/example1.ab1')));
snapgeneToJson(file, result => { 
  console.info(result)
}, options)
```

### genbankToJson

```js
//All of the xxxxToJson parsers work like this:
const genbankToJson = require('bio-parsers').genbankToJson;
//or alternatively (if using the package on the front end and you want to keep memory usage low)
const genbankToJson = require('bio-parsers/parsers/genbankToJson');

genbankToJson(string, result => {
  console.info(result)
  // [
  //     {
  //         "messages": [
  //             "Import Error: Illegal character(s) detected and removed from sequence. Allowed characters are: atgcyrswkmbvdhn",
  //             "Invalid feature end:  1384 detected for Homo sapiens and set to 1",
  //         ],
  //         "success": true,
  //         "parsedSequence": {
  //             "features": [
  //                 {
  //                     "notes": {
  //                         "organism": [
  //                             "Homo sapiens"
  //                         ],
  //                         "db_xref": [
  //                             "taxon:9606"
  //                         ],
  //                         "chromosome": [
  //                             "17"
  //                         ],
  //                         "map": [
  //                             "17q21"
  //                         ]
  //                     },
  //                     "type": "source",
  //                     "strand": 1,
  //                     "name": "Homo sapiens",
  //                     "start": 0,
  //                     "end": 1
  //                 }
  //             ],
  //             "name": "NP_003623",
  //             "sequence": "gagaggggggttatccccccttcgtcagtcgatcgtaacgtatcagcagcgcgcgagattttctggcgcagtcag",
  //             "circular": true,
  //             "extraLines": [
  //                 "DEFINITION  contactin-associated protein 1 precursor [Homo sapiens].",
  //                 "ACCESSION   NP_003623",
  //                 "VERSION     NP_003623.1  GI:4505463",
  //                 "DBSOURCE    REFSEQ: accession NM_003632.2",
  //                 "KEYWORDS    RefSeq."
  //             ],
  //             "type": "DNA",
  //             "size": 925
  //         }
  //     }
  // ]
}, options)



//or use it as a promise! 
const results = await genbankToJson(string, options)
```

You can see more examples by looking at the tests.



## Editing This Repo
### All collaborators:
Edit/create a new file and update/add any relevant tests.
Make sure they pass by running `yarn test`

## Debug
```
yarn test-debug
```

## Updating this repo
### Teselagen collaborators
Commit and push all changes
Sign into npm using the teselagen npm account (npm whoami)

```
npm version patch|minor|major
npm publish
```

### Outside collaborators
fork and pull request please :)


## Thanks/Collaborators
 - IsaacLuo - https://github.com/IsaacLuo/SnapGeneFileReader (from which the snapgene parser was adapted)
 - Joshua Nixon (original collaborator)
 - Thomas Rich (original collaborator)
