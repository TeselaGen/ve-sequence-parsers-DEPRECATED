import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import chai from 'chai';
import path from 'path';
import fs from 'fs';
import genbankToJson from '../parsers/genbankToJson';
import jsonToBed from '../parsers/jsonToBed';

chai.should();
describe("testing genbank to json to bed file format", function () {
  it("should correctly make a bed file", _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
    var genbankInfo, jsonInfo, bedInfo, correctResults;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            genbankInfo = fs.readFileSync(path.join(__dirname, './testData/genbank/AcsBmut-3pCRISPRi-242.gb'), "utf8");
            _context.next = 3;
            return genbankToJson(genbankInfo);

          case 3:
            jsonInfo = _context.sent;
            _context.next = 6;
            return jsonToBed(jsonInfo);

          case 6:
            bedInfo = _context.sent;
            correctResults = fs.readFileSync(path.join(__dirname, './testData/bed/AcsBmutJsonToBed-1.bed'), "utf8");

            bedInfo.should.equal(correctResults);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
});