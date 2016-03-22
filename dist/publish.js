'use strict';

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _locateModels = require('./phrases/locateModels');

var _locateModels2 = _interopRequireDefault(_locateModels);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Publish Module Entry
 */
var Publish = function Publish() {
  _cli2.default.ok('Loading building...');
  (0, _rimraf2.default)(process.cwd() + '/.tmp', function (err) {
    if (err) return _cli2.default.error(err);
    (0, _locateModels2.default)();
  });
};

module.exports = Publish;