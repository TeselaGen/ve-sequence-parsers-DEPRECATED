3.0.7 - jsonToGenbank can now handle features as an array or as a keyed object Eg. features: {'feat1': {start: 1, end: 4}} 
3.0.3 - Fixed browserify incompatibility with require('fs')
3.0.0 - Added options to parse feature start/end as 1-based inclusive (instead of 0-based inclusive by default) (for json->genbank, genbank->json only)
      - Along with those options, the default feature parsing is now inclusive and 0-based for both start and end instead of being exclusive 0-based for the end and inclusive 0-based for the start (which it was previously) 
      - Scrapping jbeiToJson functionality as jbeiSeq was never being used and has been deprecated
2.0.0 - Updated the names of the different parsers to follow camelCase conventions
      - Simplified jsonToGenbank (instead of using `jsonToGenbank.serializedToGenbank()`,
        now use `jsonToGenbank()` directly)
      - All parsers now available on the main export:
        `var jsonToGenbank = require('bio-parsers').jsonToGenbank`  
        As well as individually `var genbankToJson = require('bio-parsers/parsers/genbankToJson');`
      - Fixed error in tests with new options format and documented the options format
      - Added precommit/prepush hooks to run tests!
