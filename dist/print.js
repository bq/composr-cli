'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var print = {};
print.error = function (text) {
  console.log(_chalk2.default.white.bgRed.bold('Error: ') + _chalk2.default.white(text));
};
print.ok = function (text) {
  console.log(_chalk2.default.white.bgGreen.bold('OK:') + _chalk2.default.white(text));
};
print.info = function (text) {
  console.log(_chalk2.default.white.bgYellow.bold('INFO:') + _chalk2.default.white(text));
};

module.exports = print;