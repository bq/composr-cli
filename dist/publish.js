'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _simpleSpinner = require('simple-spinner');

var _simpleSpinner2 = _interopRequireDefault(_simpleSpinner);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _jsonSchemaGenerator = require('json-schema-generator');

var _jsonSchemaGenerator2 = _interopRequireDefault(_jsonSchemaGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
var buildPhrase = function buildPhrase(modelFilePath, next) {
  var phraseDir = modelFilePath.split('/');
  var phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '');
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '');
  var tmpDir = process.cwd() + '/.tmp/';
  var phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '');
  var model = require(process.cwd() + '/' + modelFilePath);
  var codehash = undefined;

  // cli.ok('building phrase:', phraseName)
  _simpleSpinner2.default.start();
  (0, _glob2.default)(phraseDir + '/*.code.js', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    files.forEach(function (file) {
      model = modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp);
    });

    var fileNameModel = phraseDirTmp + phraseName + '.model.json';

    // sacar para otra funcion, añadir comprobaciones de respuestas y schema y middlewares
    (0, _mkdirp2.default)(phraseDirTmp, function (err) {
      if (err) return _cli2.default.error(err);
      _fs2.default.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'));
      _simpleSpinner2.default.stop();
      return next(model);
    });
  });
};
/**
 * Code Generation
 */
var modelGeneration = function modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp) {
  var fileSplit = file.split('.');
  var verb = fileSplit[fileSplit.length - 3];

  var codeFilePath = process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.code.js';
  // If file exists continue if not return
  if (!_fs2.default.accessSync(codeFilePath)) return;
  return model;
};

/**
 * Locate model files
 */
var locateModels = function locateModels() {
  (0, _glob2.default)('**/*.model.json', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    _cli2.default.ok('MODELS LOCATED');
    var phraseURLs = [];
    files.forEach(function (filePath) {
      buildPhrase(filePath, function (model) {
        if (phraseURLs.indexOf(model.url) !== -1) {
          _cli2.default.error('Phrase duplicated [' + model.url + '] ' + filePath);
        }
        phraseURLs.push(model.url);
      });
    });
    return console.log(phraseURLs);
  });
};

/**
 * Publish Module Entry
 */
var Publish = function Publish() {
  _cli2.default.ok('GETTING CONFIG');
  locateModels();
};

module.exports = Publish;