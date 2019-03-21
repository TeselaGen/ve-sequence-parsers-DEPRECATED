//note: Huge credit and thanks go to IsaacLuo from whose python repository this code was adapted
// https://github.com/IsaacLuo/SnapGeneFileReader

import bufferpack from 'bufferpack';

import xml2Js from 'xml2js';
import { StringDecoder } from 'string_decoder';
import addPromiseOption from './utils/addPromiseOption';
import getArrayBufferFromFile from './utils/getArrayBufferFromFile';
import createInitialSequence from './utils/createInitialSequence';
import validateSequenceArray from './utils/validateSequenceArray';
import flattenSequenceArray from './utils/flattenSequenceArray';

async function snapgeneToJson(
  fileObj,
  onFileParsedUnwrapped,
  options = {}
) {
  /* eslint-enable no-inner-declarations*/

  const onFileParsed = function(sequences, options) {
    //before we call the onFileParsed callback, we need to flatten the sequence, and convert the old sequence data to the new data type
    onFileParsedUnwrapped(
      validateSequenceArray(flattenSequenceArray(sequences, options), options)
    );
  };
  const returnVal = createInitialSequence(options)
  /* eslint-disable no-inner-declarations*/
  const arrayBuffer = await getArrayBufferFromFile(fileObj);

  let offset = 0;
  function read(size, fmt) {
    const buffer = Buffer.from(arrayBuffer.slice(offset, size + offset));
    offset += size;
    if (fmt) {
      const decoder = new StringDecoder(fmt);
      const toRet = decoder.write(buffer);
      return toRet;
    } else {
      return buffer;
    }
  }

  async function unpack(size, mode) {
    const buffer = await read(size);
    const unpacked = await bufferpack.unpack(">" + mode, buffer);
    if (unpacked === undefined) return undefined;
    return await unpacked[0];
  }

  await read(1); //read the first byte
  // READ THE DOCUMENT PROPERTIES
  const length = await unpack(4, "I");
  const title = await read(8, "ascii");
  if (length !== 14 || title !== "SnapGene") {
    throw new Error("Wrong format for a SnapGene file !");
  }
  const data = await {
    ...returnVal.parsedSequence,
    isDNA: !!await unpack(2, "H"),
    exportVersion: await unpack(2, "H"),
    importVersion: await unpack(2, "H"),
    features: []
  };
  while (offset <= arrayBuffer.byteLength) {
    // # READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
    const next_byte = await read(1);
    
    // # next_byte table
    // # 0: dna sequence
    // # 1: compressed DNA
    // # 2: unknown
    // # 3: unknown
    // # 5: primers
    // # 6: notes
    // # 7: history tree
    // # 8: additional sequence properties segment
    // # 9: file Description
    // # 10: features
    // # 11: history node
    // # 13: unknown
    // # 16: alignable sequence
    // # 17: alignable sequence
    // # 18: sequence trace
    // # 19: Uracil Positions
    // # 20: custom DNA colors

    // if (!next_byte) {
    //   //   # END OF FILE
    //   return (keepgoing = false);
    // }

    const block_size = await unpack(4, "I");
    if (ord(next_byte) === 0) {
      //   # READ THE SEQUENCE AND ITS PROPERTIES
      const props = await unpack(1, "b");
      const binaryRep = dec2bin(props)

      data.circular = isFirstBitA1(binaryRep)
      const size = block_size - 1;
      if (size < 0) return 
      data.size = size;
      //   data["dna"] = {
      //     topology="circular" if props & 0x01 else "linear",
      //     strandedness="double" if props & 0x02 > 0 else "single",
      //     damMethylated=props & 0x04 > 0,
      //     dcmMethylated=props & 0x08 > 0,
      //     ecoKIMethylated=props & 0x10 > 0,
      //     length=block_size - 1
      //   }
      data.sequence = await read(size, "ascii");
    } else if (ord(next_byte) === 10) {
      // else if (ord(next_byte) === 6) {
      //   //       # READ THE NOTES
      //   const block_content = read(block_size, "utf8");
      //   const xml = parseXml(block_content);
      //   //   note_data = parse_dict(xmltodict.parse(block_content))
      //   //   data['notes'] = note_data['Notes']
      // }
      //   # READ THE FEATURES
      const strand_dict = { "0": ".", "1": "+", "2": "-", "3": "=" };
      //   const format_dict = {'@text': parse, '@int': int}

      const xml = await read(block_size, "utf8");
      const b = await parseXml(xml);
      const { Features: { Feature = [] } = {} } = b;
      data.features = [];
      Feature.forEach(({ $: attrs, Q: additionalAttrs = [], Segment = [] }) => {
        let color;
        let maxStart = 0;
        let maxEnd = 0;
        const segments =
          Segment &&
          Segment.map(({ $: seg }) => {
            if (!seg) throw new Error("invalid feature definition");
            const { range } = seg;
            color = seg.color;
            const { start, end } = getStartAndEndFromRangeString(range);
            maxStart = Math.max(maxStart, start);
            maxEnd = Math.max(maxEnd, end);
            return {
              ...seg,
              start,
              end
            };
          });
        const { directionality } = attrs;
        data.features.push({
          ...attrs,
          strand: strand_dict[directionality],
          start: maxStart,
          end: maxEnd,
          color,
          segments
        });
      });
    } else {
      // # WE IGNORE THE WHOLE BLOCK
      await read(block_size); //we don't do anything with this
    }
  }
  returnVal.parsedSequence = data
  onFileParsed([returnVal]);
}

function getStartAndEndFromRangeString(rangestring) {
  const [start, end] = rangestring.split("-");
  return {
    start: start - 1,
    end: end - 1
  };
}

function ord(string) {
  //  discuss at: http://locutus.io/php/ord/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K')
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536

  let str = string + "";
  let code = str.charCodeAt(0);

  if (code >= 0xd800 && code <= 0xdbff) {
    // High surrogate (could change last hex to 0xDB7F to treat
    // high private surrogates as single characters)
    let hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate,
      // so we return its value;
      return code;
      // we could also throw an error as it is not a complete character,
      // but someone may want to know
    }
    let low = str.charCodeAt(1);
    return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
  }
  if (code >= 0xdc00 && code <= 0xdfff) {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate,
    // so we return its value;
    return code;
    // we could also throw an error as it is not a complete character,
    // but someone may want to know
  }

  return code;
}

function parseXml(string) {
  return new Promise((resolve, reject) => {
    xml2Js.parseString(string, (err, result) => {
      err && reject(err);
      resolve(result);
    });
  });
}


export default addPromiseOption(snapgeneToJson);

function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

function isFirstBitA1(num){
  return Number(num.toString().split('').pop()) === 1
}