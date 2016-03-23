'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _async = require('async2');

var _async2 = _interopRequireDefault(_async);

var _buildPhrase = require('./buildPhrase');

var _buildPhrase2 = _interopRequireDefault(_buildPhrase);

var _gauge = require('gauge');

var _gauge2 = _interopRequireDefault(_gauge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gauge = new _gauge2.default();

/**
 * Locate model files
 */
var locateModels = function locateModels(next) {
  // progressBAr
  var progress = 0;
  (0, _glob2.default)('**/*.model.json', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    var phraseURLs = [];
    var increment = 1 / files.length;
    _cli2.default.ok(files.length + ' Phrases models founds');
    // bulk execution
    var buildPhrasesExecList = [];
    var phrasesCreated = [];
    files.forEach(function (filePath) {
      progress += increment;
      gauge.show('Building Phrases → ' + filePath, progress);
      buildPhrasesExecList.push(function (callback) {
        (0, _buildPhrase2.default)(filePath, gauge, function (err, model) {
          if (err) {
            return callback(err);
          } else {
            var response = { model: model, filePath: filePath };
            phrasesCreated.push(response);
            return callback(null, response);
          }
        });
      });
    });

    gauge.hide();
    gauge.disable();

    _async2.default.parallel(buildPhrasesExecList, function (err, results) {
      if (err) _cli2.default.error(err);
      if (phrasesCreated.length > 0) {
        phrasesCreated.forEach(function (result) {
          phraseURLs.push(result.model.url);
        });
      }
      return next(err, results);
    });
  });
};

module.exports = locateModels;