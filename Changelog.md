2.0.0 - Updated the names of the different parsers to follow camelCase conventions
      - Simplified jsonToGenbank (instead of using `jsonToGenbank.serializedToGenbank()`,
        now use `jsonToGenbank()` directly)
      - All parsers now available on the main export:
        `var jsonToGenbank = require('bio-parsers').jsonToGenbank`  
        As well as individually `var genbankToJson = require('bio-parsers/parsers/genbankToJson');`
      - Fixed error in tests with new options format and documented the options format
      - Added precommit/prepush hooks to run tests!
