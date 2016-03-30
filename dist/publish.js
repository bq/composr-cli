'use strict';

var _print = require('./print');

var _print2 = _interopRequireDefault(_print);

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
var Publish = function Publish(config, options) {
  // Execution all tasks in serie
  _print2.default.ok('Loading building...');
  // Clean TMP Directory
  (0, _rimraf2.default)(process.cwd() + '/.tmp', function (err) {
    if (err) return _print2.default.error(err);
    // Build Phrase tasks
    (0, _locateModels2.default)(config, function (err, result) {
      if (err) _print2.default.error(err);
      // Build Snippets tasks
      (0, _buildSnippets2.default)(config, function (err, result) {
        if (err) return _print2.default.error(err);
        _print2.default.ok('All Phrases and snippets builts');
      });
    });
  });
};

module.exports = Publish;