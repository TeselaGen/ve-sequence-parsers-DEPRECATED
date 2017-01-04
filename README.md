#Bio Parsers
##About this Repo
This repo contains a set of parsers to convert between datatypes through a generalized JSON format.

Use the following files to convert to a generalized JSON format:
```
fastaToJson
genbankToJson
sbolXmlToJson
anyToJson    //this handles any of the above file types based on file extension
```

Use the following file(s) to convert from a generalized JSON format back to a specific format:
```
jsonToGenbank
```

The generalized JSON format looks like:
```
var generalizedJsonFormat = {
    "size" : 25,
    "sequence" : "asaasdgasdgasdgasdgasgdasgdasdgasdgasgdagasdgasdfasdfdfasdfa",
    "circular" : true,
    "name" : "pBbS8c-RFP",
    "description" : "",
    "features" : [
        {
            "name" : "anonymous feature",
            "type" : "misc_feature",
            "id" : "5590c1978979df000a4f02c7", //Must be a unique id. If no id is provided, we'll autogenerate one for you
            "start" : 1,
            "end" : 3,
            "strand" : 1,
            "notes" : {},
        },
        {
            "name" : "coding region 1",
            "type" : "CDS",
            "id" : "5590c1d88979df000a4f02f5",
            "start" : 12,
            "end" : 9,
            "strand" : -1,
            "notes" : {},
        }
    ],
}
```


##Useage:
`npm install -S bio-parsers`
```js
//To go from json to genbank:
var jsonToGenbank = require('bio-parsers').jsonToGenbank;
//or alternatively (if using the package on the front end and you want to keep memory usage low)
var jsonToGenbank = require('bio-parsers/parsers/jsonToGenbank');
//You can pass an optional options object as the second argument. Here are the defaults
var options = {
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
var genbankString = jsonToGenbank(generalizedJsonFormat, options)

//All of the xXXXtoJson parsers work like this:
var genbankToJson = require('bio-parsers').genbankToJson;
//or alternatively (if using the package on the front end and you want to keep memory usage low)
var genbankToJson = require('bio-parsers/parsers/genbankToJson');
//You can pass an optional options object as the third argument. Here are the defaults
var options = {
  isProtein: false, //used to strip unwanted characters
  //genbankToJson options only
  inclusive1BasedStart: false //by default feature starts are parsed out as 0-based and inclusive 
  inclusive1BasedEnd: false //by default feature ends are parsed out as 0-based and inclusive 
}
genbankToJson(string, function(result) {
  console.log(result)
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
},options)
```

You can see more examples by looking at the tests.



##Editing This Repo:
###All collaborators: 
Edit/create a new file and update/add any relevant tests.
Make sure they pass by running `npm test`

##Debug:
```
mocha ./test --inspect --debug-brk
```

##Updating this repo: 
###Teselagen collaborators: 
Commit and push all changes
Sign into npm using the teselagen npm account (npm whoami)

```
npm version patch|minor|major
npm publish
```

###Outside collaborators: 
fork and pull request please :)
