'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ab1ToJson = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(fileObj, onFileParsed) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var arrayBuffer, dataview, converter, chromatogramData, returnVal;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _getArrayBufferFromFile2.default)(fileObj);

          case 2:
            arrayBuffer = _context.sent;
            dataview = new DataView(arrayBuffer);
            converter = new abConverter(dataview);
            chromatogramData = converter.getTraceData();
            returnVal = (0, _createInitialSequence2.default)(options);

            returnVal.parsedSequence = _extends({}, returnVal.parsedSequence, {
              sequence: chromatogramData.baseCalls.join(""),
              chromatogramData: chromatogramData
            });
            onFileParsed([returnVal]);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function ab1ToJson(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _createInitialSequence = require('./utils/createInitialSequence');

var _createInitialSequence2 = _interopRequireDefault(_createInitialSequence);

var _addPromiseOption = require('./utils/addPromiseOption');

var _addPromiseOption2 = _interopRequireDefault(_addPromiseOption);

var _getArrayBufferFromFile = require('./utils/getArrayBufferFromFile');

var _getArrayBufferFromFile2 = _interopRequireDefault(_getArrayBufferFromFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (0, _addPromiseOption2.default)(ab1ToJson);


function abConverter(inputArrayBuffer) {
  var dirLocation = inputArrayBuffer.getInt32(26);
  var numElements = inputArrayBuffer.getInt32(18);
  var lastEntry = dirLocation + numElements * 28;

  this.getFileID = function () {
    var output = "";
    for (var offset = 0; offset < 4; offset++) {
      output += String.fromCharCode(inputArrayBuffer.getInt8(offset));
    }
    return output;
  };

  this.getFileVersion = function () {
    return inputArrayBuffer.getInt16(4);
  };

  this.getDirectoryStruct = function () {
    var br = "<br>";
    // const indent = "  ";
    var output = br;
    var name = "";
    for (var offset = 6; offset < 10; offset++) {
      name += String.fromCharCode(inputArrayBuffer.getInt8(offset));
    }
    output += '- tag name: ' + name + br;
    output += '- tag number: ' + inputArrayBuffer.getInt32(10) + br;
    output += '- element type: ' + inputArrayBuffer.getInt16(14) + br;
    output += '- element size: ' + inputArrayBuffer.getInt16(16) + br;
    output += '- num elements: ' + inputArrayBuffer.getInt32(18) + br;
    output += '- data size: ' + inputArrayBuffer.getInt32(22) + br;
    output += '- data offset: ' + inputArrayBuffer.getInt32(26) + br;
    return output;
  };

  this.getNumber = function (inOffset, numEntries) {
    var retArray = [];
    for (var counter = 0; counter < numEntries; counter += 1) {
      retArray.push(inputArrayBuffer.getInt8(inOffset + counter));
    }
    return retArray;
  };

  this.getChar = function (inOffset, numEntries) {
    var retArray = [];
    for (var counter = 0; counter < numEntries; counter += 1) {
      retArray.push(String.fromCharCode(inputArrayBuffer.getInt8(inOffset + counter)));
    }
    return retArray;
  };

  this.getShort = function (inOffset, numEntries) {
    var retArray = [];
    for (var counter = 0; counter < numEntries; counter += 2) {
      retArray.push(inputArrayBuffer.getInt16(inOffset + counter));
    }
    return retArray;
  };

  this.getByte = function (inOffset, counter) {
    return inputArrayBuffer.getUint8(inOffset + counter);
  };

  this.getWord = function (inOffset, numEntries) {
    var retVal = "";
    for (var counter = 0; counter < numEntries; counter += 2) {
      retVal += inputArrayBuffer.getUint16(inOffset + counter);
    }
    return retVal;
  };

  this.getLong = function (inOffset, counter) {
    return inputArrayBuffer.getInt32(inOffset);
  };

  this.getFloat = function (inOffset, counter) {
    return inputArrayBuffer.getFloat32(inOffset);
  };

  this.getDouble = function (inOffset, counter) {
    return inputArrayBuffer.getFloat64(inOffset);
  };

  this.getDate = function (inOffset, counter) {
    var date = "";
    date += inputArrayBuffer.getInt16(inOffset);
    date += inputArrayBuffer.getUint8(inOffset + 2);
    date += inputArrayBuffer.getUint8(inOffset + 3);
    return date;
  };

  this.getTime = function (inOffset, counter) {
    var time = "";
    time += inputArrayBuffer.getUint8(inOffset);
    time += inputArrayBuffer.getUint8(inOffset + 1);
    time += inputArrayBuffer.getUint8(inOffset + 2);
    time += inputArrayBuffer.getUint8(inOffset + 3);
    return time;
  };

  // this.getPString = (inOffset, counter) => {
  //   let outString = "";
  //   for (let count = 1; count < inputArrayBuffer.getInt8(inOffset); count++) {
  //     outString += inputArrayBuffer.getInt8(inOffset + count);
  //   }
  // };

  // this.getCString = (inOffset, counter) => {
  //   let outString = "";
  //   let offset = inOffset;
  //   let currentByte = inputArrayBuffer.getInt8(offset);
  //   while (currentByte != 0) {
  //     outString += String.fromCharCode(currentByte);
  //     offset++;
  //     currentByte = inputArrayBuffer.getInt8(offset);
  //   }
  //   return outString;
  // };

  this.getTagName = function (inOffset) {
    var name = "";
    for (var loopOffset = inOffset; loopOffset < inOffset + 4; loopOffset++) {
      name += String.fromCharCode(inputArrayBuffer.getInt8(loopOffset));
    }
    return name;
  };

  this.getDataTag = function (inTag) {
    var output = void 0;
    var curElem = dirLocation;
    do {
      var currTagName = this.getTagName(curElem);
      var tagNum = inputArrayBuffer.getInt32(curElem + 4);
      // eslint-disable-next-line eqeqeq
      if (currTagName == inTag.tagName && tagNum === inTag.tagNum) {
        var numEntries = inputArrayBuffer.getInt32(curElem + 16);
        var entryOffset = inputArrayBuffer.getInt32(curElem + 20);
        output = this[inTag.typeToReturn](entryOffset, numEntries);
      }
      curElem += 28;
    } while (curElem < lastEntry);
    return output;
  };

  this.getTraceData = function () {
    var traceData = {};
    traceData.aTrace = this.getDataTag(tagDict.colorDataA);
    traceData.tTrace = this.getDataTag(tagDict.colorDataT);
    traceData.gTrace = this.getDataTag(tagDict.colorDataG);
    traceData.cTrace = this.getDataTag(tagDict.colorDataC);
    traceData.basePos = this.getDataTag(tagDict.peakLocations);
    traceData.baseCalls = this.getDataTag(tagDict.baseCalls2);
    traceData.qualNums = this.getDataTag(tagDict.qualNums);

    return traceData;
  };

  this.getFirstEntry = function () {
    var output = "";
    for (var curElem = dirLocation; curElem < lastEntry; curElem += 28) {
      var name = "";
      for (var offset = curElem; offset < curElem + 4; offset++) {
        name += String.fromCharCode(inputArrayBuffer.getInt8(offset));
      }
      output += ' - ' + name;
    }
    return output;
  };
}

var tagDict = {
  baseCalls1: { tagName: "PBAS", tagNum: 1, typeToReturn: "getChar" },
  baseCalls2: { tagName: "PBAS", tagNum: 2, typeToReturn: "getChar" },
  qualNums: { tagName: "PCON", tagNum: 2, typeToReturn: "getNumber" },
  peakLocations: { tagName: "PLOC", tagNum: 2, typeToReturn: "getShort" },
  peakDev: { tagName: "P1RL", tagNum: 1, typeToReturn: "getShort" },
  peakOneAmp: { tagName: "P1AM", tagNum: 1, typeToReturn: "getShort" },
  colorDataA: { tagName: "DATA", tagNum: 10, typeToReturn: "getShort" },
  colorDataT: { tagName: "DATA", tagNum: 11, typeToReturn: "getShort" },
  colorDataG: { tagName: "DATA", tagNum: 9, typeToReturn: "getShort" },
  colorDataC: { tagName: "DATA", tagNum: 12, typeToReturn: "getShort" }
};
module.exports = exports['default'];