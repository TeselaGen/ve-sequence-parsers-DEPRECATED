import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var snapgeneToJson = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(fileObj, onFileParsedUnwrapped) {
    var _this = this;

    var unpack = function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(size, mode) {
        var buffer, unpacked;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return read(size);

              case 2:
                buffer = _context.sent;
                _context.next = 5;
                return bufferpack.unpack(">" + mode, buffer);

              case 5:
                unpacked = _context.sent;

                if (!(unpacked === undefined)) {
                  _context.next = 8;
                  break;
                }

                return _context.abrupt('return', undefined);

              case 8:
                _context.next = 10;
                return unpacked[0];

              case 10:
                return _context.abrupt('return', _context.sent);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function unpack(_x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var onFileParsed, returnVal, arrayBuffer, offset, read, length, title, data, next_byte, block_size, props, binaryRep, size;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            read = function read(size, fmt) {
              var buffer = Buffer.from(arrayBuffer.slice(offset, size + offset));
              offset += size;
              if (fmt) {
                var decoder = new StringDecoder(fmt);
                var toRet = decoder.write(buffer);
                return toRet;
              } else {
                return buffer;
              }
            };

            /* eslint-enable no-inner-declarations*/

            onFileParsed = function onFileParsed(sequences, options) {
              //before we call the onFileParsed callback, we need to flatten the sequence, and convert the old sequence data to the new data type
              onFileParsedUnwrapped(validateSequenceArray(flattenSequenceArray(sequences, options), options));
            };

            returnVal = createInitialSequence(options);
            /* eslint-disable no-inner-declarations*/

            _context3.next = 5;
            return getArrayBufferFromFile(fileObj);

          case 5:
            arrayBuffer = _context3.sent;
            offset = 0;
            _context3.next = 9;
            return read(1);

          case 9:
            _context3.next = 11;
            return unpack(4, "I");

          case 11:
            length = _context3.sent;
            _context3.next = 14;
            return read(8, "ascii");

          case 14:
            title = _context3.sent;

            if (!(length !== 14 || title !== "SnapGene")) {
              _context3.next = 17;
              break;
            }

            throw new Error("Wrong format for a SnapGene file !");

          case 17:
            _context3.t0 = _extends;
            _context3.t1 = {};
            _context3.t2 = returnVal.parsedSequence;
            _context3.next = 22;
            return unpack(2, "H");

          case 22:
            _context3.t3 = !!_context3.sent;
            _context3.next = 25;
            return unpack(2, "H");

          case 25:
            _context3.t4 = _context3.sent;
            _context3.next = 28;
            return unpack(2, "H");

          case 28:
            _context3.t5 = _context3.sent;
            _context3.t6 = [];
            _context3.t7 = {
              isDNA: _context3.t3,
              exportVersion: _context3.t4,
              importVersion: _context3.t5,
              features: _context3.t6
            };
            _context3.next = 33;
            return (0, _context3.t0)(_context3.t1, _context3.t2, _context3.t7);

          case 33:
            data = _context3.sent;

          case 34:
            if (!(offset <= arrayBuffer.byteLength)) {
              _context3.next = 64;
              break;
            }

            _context3.next = 37;
            return read(1);

          case 37:
            next_byte = _context3.sent;
            _context3.next = 40;
            return unpack(4, "I");

          case 40:
            block_size = _context3.sent;

            if (!(ord(next_byte) === 0)) {
              _context3.next = 56;
              break;
            }

            _context3.next = 44;
            return unpack(1, "b");

          case 44:
            props = _context3.sent;
            binaryRep = dec2bin(props);


            data.circular = isFirstBitA1(binaryRep);
            size = block_size - 1;

            if (!(size < 0)) {
              _context3.next = 50;
              break;
            }

            return _context3.abrupt('return');

          case 50:
            data.size = size;
            //   data["dna"] = {
            //     topology="circular" if props & 0x01 else "linear",
            //     strandedness="double" if props & 0x02 > 0 else "single",
            //     damMethylated=props & 0x04 > 0,
            //     dcmMethylated=props & 0x08 > 0,
            //     ecoKIMethylated=props & 0x10 > 0,
            //     length=block_size - 1
            //   }
            _context3.next = 53;
            return read(size, "ascii");

          case 53:
            data.sequence = _context3.sent;
            _context3.next = 62;
            break;

          case 56:
            if (!(ord(next_byte) === 10)) {
              _context3.next = 60;
              break;
            }

            return _context3.delegateYield( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
              var strand_dict, xml, b, _b$Features, _b$Features$Feature, Feature;

              return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      // else if (ord(next_byte) === 6) {
                      //   //       # READ THE NOTES
                      //   const block_content = read(block_size, "utf8");
                      //   const xml = parseXml(block_content);
                      //   //   note_data = parse_dict(xmltodict.parse(block_content))
                      //   //   data['notes'] = note_data['Notes']
                      // }
                      //   # READ THE FEATURES
                      strand_dict = { "0": ".", "1": "+", "2": "-", "3": "=" };
                      //   const format_dict = {'@text': parse, '@int': int}

                      _context2.next = 3;
                      return read(block_size, "utf8");

                    case 3:
                      xml = _context2.sent;
                      _context2.next = 6;
                      return parseXml(xml);

                    case 6:
                      b = _context2.sent;
                      _b$Features = b.Features;
                      _b$Features = _b$Features === undefined ? {} : _b$Features;
                      _b$Features$Feature = _b$Features.Feature, Feature = _b$Features$Feature === undefined ? [] : _b$Features$Feature;

                      data.features = [];
                      Feature.forEach(function (_ref3) {
                        var attrs = _ref3.$,
                            _ref3$Q = _ref3.Q,
                            additionalAttrs = _ref3$Q === undefined ? [] : _ref3$Q,
                            _ref3$Segment = _ref3.Segment,
                            Segment = _ref3$Segment === undefined ? [] : _ref3$Segment;

                        var color = void 0;
                        var maxStart = 0;
                        var maxEnd = 0;
                        var segments = Segment && Segment.map(function (_ref4) {
                          var seg = _ref4.$;

                          if (!seg) throw new Error("invalid feature definition");
                          var range = seg.range;

                          color = seg.color;

                          var _getStartAndEndFromRa = getStartAndEndFromRangeString(range),
                              start = _getStartAndEndFromRa.start,
                              end = _getStartAndEndFromRa.end;

                          maxStart = Math.max(maxStart, start);
                          maxEnd = Math.max(maxEnd, end);
                          return _extends({}, seg, {
                            start: start,
                            end: end
                          });
                        });
                        var directionality = attrs.directionality;

                        data.features.push(_extends({}, attrs, {
                          strand: strand_dict[directionality],
                          start: maxStart,
                          end: maxEnd,
                          color: color,
                          segments: segments
                        }));
                      });

                    case 12:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, _callee2, _this);
            })(), 't8', 58);

          case 58:
            _context3.next = 62;
            break;

          case 60:
            _context3.next = 62;
            return read(block_size);

          case 62:
            _context3.next = 34;
            break;

          case 64:
            returnVal.parsedSequence = data;
            onFileParsed([returnVal]);

          case 66:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function snapgeneToJson(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

function getStartAndEndFromRangeString(rangestring) {
  var _rangestring$split = rangestring.split("-"),
      start = _rangestring$split[0],
      end = _rangestring$split[1];

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

  var str = string + "";
  var code = str.charCodeAt(0);

  if (code >= 0xd800 && code <= 0xdbff) {
    // High surrogate (could change last hex to 0xDB7F to treat
    // high private surrogates as single characters)
    var hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate,
      // so we return its value;
      return code;
      // we could also throw an error as it is not a complete character,
      // but someone may want to know
    }
    var low = str.charCodeAt(1);
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
  return new Promise(function (resolve, reject) {
    xml2Js.parseString(string, function (err, result) {
      err && reject(err);
      resolve(result);
    });
  });
}

export default addPromiseOption(snapgeneToJson);

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function isFirstBitA1(num) {
  return Number(num.toString().split('').pop()) === 1;
}