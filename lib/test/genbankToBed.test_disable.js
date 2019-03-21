'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _genbankToJson = require('../parsers/genbankToJson');

var _genbankToJson2 = _interopRequireDefault(_genbankToJson);

var _jsonToBed = require('../parsers/jsonToBed');

var _jsonToBed2 = _interopRequireDefault(_jsonToBed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_chai2.default.should();
describe("testing genbank to json to bed file format", function () {
  it("should correctly make a bed file", _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var genbankInfo, jsonInfo, bedInfo, correctResults;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            genbankInfo = _fs2.default.readFileSync(_path2.default.join(__dirname, './testData/genbank/AcsBmut-3pCRISPRi-242.gb'), "utf8");
            _context.next = 3;
            return (0, _genbankToJson2.default)(genbankInfo);

          case 3:
            jsonInfo = _context.sent;
            _context.next = 6;
            return (0, _jsonToBed2.default)(jsonInfo);

          case 6:
            bedInfo = _context.sent;
            correctResults = _fs2.default.readFileSync(_path2.default.join(__dirname, './testData/bed/AcsBmutJsonToBed-1.bed'), "utf8");

            bedInfo.should.equal(correctResults);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
});