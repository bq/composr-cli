'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _modelGeneration = require('./modelGeneration');

var _modelGeneration2 = _interopRequireDefault(_modelGeneration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
var buildPhrase = function buildPhrase(modelFilePath, gauge, next) {
  var phraseDir = modelFilePath.split('/');
  var phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '');
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '');
  var tmpDir = process.cwd() + '/.tmp/';
  var phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '');
  var model = require(process.cwd() + '/' + modelFilePath);
  gauge.pulse(phraseName);
  // Create temporal folder
  (0, _mkdirp2.default)(phraseDirTmp, function (err) {
    if (err) {
      _cli2.default.error(err);
      return next(err, null);
    }
    // looking for code files related to model
    (0, _glob2.default)(process.cwd() + '/' + phraseDir + '*.code.js', null, function (err, files) {
      if (err) return next(null, model);
      files.forEach(function (file) {
        (0, _modelGeneration2.default)(file, phraseDir, phraseName, model, phraseDirTmp, function (err, result) {
          if (err) _cli2.default.error(err);
          var fileNameModel = phraseDirTmp + phraseName + '.model.json';
          _fs2.default.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'));
          // spinner.stop()
          return next(null, result);
        });
      });
    });
  });
};

module.exports = buildPhrase;