##Teselagen Sequence Parsers
This repo contains a set of parsers to convert between datatypes through a generalized JSON format. 

Use the following files to convert to a generalized JSON format: 
```
FastaToJSON
GenbankToJSON
JbeiseqToJSON
SbolOrJbeiSeqXMLToJSON
anyToJSON    //this handles any of the above file types based on file extension
```

Use the following file(s) to convert from a generalized JSON format back to a specific format:
```
JSONToGenbank
```

The generalized JSON format looks like: 
```
{
    "size" : 25,
    "sequence" : "asaasdgasdgasdgasdgasgdasgdasdgasdgasgdagasdgasdfasdfdfasdfa",
    "circular" : true,
    "name" : "pBbS8c-RFP",
    "description" : "",
    "features" : [
        {
            "name" : "anonymous feature",
            "type" : "misc_feature",
            "id" : "5590c1978979df000a4f02c7",
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
You can see more examples by looking at the tests.


##Contributing:
first make an issue

then make a PR 

make sure it doesn't break anything: `npm test`
