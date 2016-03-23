'use strict';

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _locateModels = require('./phrases/locateModels');

var _locateModels2 = _interopRequireDefault(_locateModels);

var _buildSnippets = require('./snippets/buildSnippets');

var _buildSnippets2 = _interopRequireDefault(_buildSnippets);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Publish Module Entry
 */
var Publish = function Publish() {
  // Execution all tasks in series
  _cli2.default.ok('Loading building...');
  // Clean TMP Directory
  (0, _rimraf2.default)(process.cwd() + '/.tmp', function (err) {
    if (err) return _cli2.default.error(err);
    // Build Phrase tasks
    (0, _locateModels2.default)(function (err, result) {
      if (err) _cli2.default.error(err);
      // Build Snippets tasks
      (0, _buildSnippets2.default)(function (err, result) {
        if (err) return _cli2.default.error(err);
        _cli2.default.ok('All Phrases and snippets builts');
      });
    });
  });
};

module.exports = Publish;